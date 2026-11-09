import { ponder } from '@/generated';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// -------------------------------------------------------------
// TOKEN REGISTRY EVENT HANDLERS
// -------------------------------------------------------------

ponder.on('TokenRegistry:TokenRegistered', async ({ event, context }) => {
  const { Token } = context.db;
  const tokenAddress = event.args.tokenAddress.toLowerCase();

  await Token.create({
    id: tokenAddress,
    data: {
      name: '',
      symbol: event.args.symbol,
      decimals: 18,
      issuerName: event.args.issuerName,
      issuerWebsite: '',
      reserveProofURI: '',
      originalNetwork: 'PISO Native',
      provenance: Number(event.args.provenance),
      isVerified: false,
      isDeprecated: false,
      isPaused: false,
      totalSupply: 0n,
      totalMinted: 0n,
      totalBurned: 0n,
      holderCount: 0,
      registeredAt: BigInt(event.args.timestamp),
      verifiedAt: 0n,
    },
  });
});

ponder.on('TokenRegistry:TokenVerified', async ({ event, context }) => {
  const { Token } = context.db;
  const tokenAddress = event.args.tokenAddress.toLowerCase();

  await Token.update({
    id: tokenAddress,
    data: {
      isVerified: true,
      verifiedAt: BigInt(event.args.timestamp),
    },
  });
});

ponder.on('TokenRegistry:TokenVerificationRevoked', async ({ event, context }) => {
  const { Token } = context.db;
  const tokenAddress = event.args.tokenAddress.toLowerCase();

  await Token.update({
    id: tokenAddress,
    data: {
      isVerified: false,
      verifiedAt: 0n,
    },
  });
});

ponder.on('TokenRegistry:ReserveProofUpdated', async ({ event, context }) => {
  const { Token } = context.db;
  const tokenAddress = event.args.tokenAddress.toLowerCase();

  await Token.update({
    id: tokenAddress,
    data: {
      reserveProofURI: event.args.newProofURI,
    },
  });
});

ponder.on('TokenRegistry:TokenDeprecated', async ({ event, context }) => {
  const { Token } = context.db;
  const tokenAddress = event.args.tokenAddress.toLowerCase();

  await Token.update({
    id: tokenAddress,
    data: {
      isDeprecated: event.args.isDeprecated,
    },
  });
});

// -------------------------------------------------------------
// STABLECOIN EVENT HANDLERS (TRANSFER, MINT, BURN, PAUSE)
// -------------------------------------------------------------

ponder.on('PisoStablecoin:Transfer', async ({ event, context }) => {
  const { Token, AccountBalance, TransferEvent, DailyAnalytics } = context.db;
  const tokenAddress = event.log.address.toLowerCase();
  const from = event.args.from.toLowerCase();
  const to = event.args.to.toLowerCase();
  const value = event.args.value;
  const blockTime = event.block.timestamp;
  const txHash = event.transaction.hash;

  // 1. Record immutable transfer event
  await TransferEvent.create({
    id: `${txHash}-${event.log.logIndex}`,
    data: {
      tokenAddress,
      from,
      to,
      value,
      blockNumber: event.block.number,
      timestamp: blockTime,
      transactionHash: txHash,
    },
  });

  // 2. Adjust sender balance (if not minting from zero address)
  if (from !== ZERO_ADDRESS) {
    const senderId = `${tokenAddress}-${from}`;
    const senderAcc = await AccountBalance.findUnique({ id: senderId });
    const currentBal = senderAcc?.balance ?? 0n;
    const newBal = currentBal >= value ? currentBal - value : 0n;

    await AccountBalance.upsert({
      id: senderId,
      create: {
        tokenAddress,
        accountAddress: from,
        balance: 0n,
        lastTransferTimestamp: blockTime,
      },
      update: {
        balance: newBal,
        lastTransferTimestamp: blockTime,
      },
    });

    // If sender balance dropped to zero, decrement holderCount
    if (currentBal > 0n && newBal === 0n) {
      const tokenRecord = await Token.findUnique({ id: tokenAddress });
      if (tokenRecord && tokenRecord.holderCount > 0) {
        await Token.update({
          id: tokenAddress,
          data: { holderCount: tokenRecord.holderCount - 1 },
        });
      }
    }
  }

  // 3. Adjust recipient balance (if not burning to zero address)
  if (to !== ZERO_ADDRESS) {
    const recipientId = `${tokenAddress}-${to}`;
    const recipientAcc = await AccountBalance.findUnique({ id: recipientId });
    const currentBal = recipientAcc?.balance ?? 0n;
    const newBal = currentBal + value;

    await AccountBalance.upsert({
      id: recipientId,
      create: {
        tokenAddress,
        accountAddress: to,
        balance: value,
        lastTransferTimestamp: blockTime,
      },
      update: {
        balance: newBal,
        lastTransferTimestamp: blockTime,
      },
    });

    // If recipient is a new holder (balance was 0), increment holderCount
    if (currentBal === 0n && newBal > 0n) {
      const tokenRecord = await Token.findUnique({ id: tokenAddress });
      if (tokenRecord) {
        await Token.update({
          id: tokenAddress,
          data: { holderCount: tokenRecord.holderCount + 1 },
        });
      }
    }
  }

  // 4. Update daily analytics rollup
  const dateStr = new Date(Number(blockTime) * 1000).toISOString().split('T')[0];
  const analyticsId = `${tokenAddress}-${dateStr}`;
  const daily = await DailyAnalytics.findUnique({ id: analyticsId });

  if (daily) {
    await DailyAnalytics.update({
      id: analyticsId,
      data: {
        transferCount: daily.transferCount + 1,
        dailyVolume: daily.dailyVolume + value,
      },
    });
  } else {
    await DailyAnalytics.create({
      id: analyticsId,
      data: {
        tokenAddress,
        date: dateStr,
        transferCount: 1,
        dailyVolume: value,
        netSupplyChange: 0n,
      },
    });
  }
});

ponder.on('PisoStablecoin:Mint', async ({ event, context }) => {
  const { Token, MintEvent } = context.db;
  const tokenAddress = event.log.address.toLowerCase();
  const amount = event.args.amount;

  await MintEvent.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      tokenAddress,
      minter: event.args.minter.toLowerCase(),
      to: event.args.to.toLowerCase(),
      amount,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
    },
  });

  const token = await Token.findUnique({ id: tokenAddress });
  if (token) {
    await Token.update({
      id: tokenAddress,
      data: {
        totalSupply: token.totalSupply + amount,
        totalMinted: token.totalMinted + amount,
      },
    });
  }
});

ponder.on('PisoStablecoin:Burn', async ({ event, context }) => {
  const { Token, BurnEvent } = context.db;
  const tokenAddress = event.log.address.toLowerCase();
  const amount = event.args.amount;

  await BurnEvent.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      tokenAddress,
      burner: event.args.burner.toLowerCase(),
      from: event.args.from.toLowerCase(),
      amount,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
    },
  });

  const token = await Token.findUnique({ id: tokenAddress });
  if (token) {
    const newSupply = token.totalSupply >= amount ? token.totalSupply - amount : 0n;
    await Token.update({
      id: tokenAddress,
      data: {
        totalSupply: newSupply,
        totalBurned: token.totalBurned + amount,
      },
    });
  }
});

ponder.on('PisoStablecoin:EmergencyPaused', async ({ event, context }) => {
  const { Token } = context.db;
  const tokenAddress = event.log.address.toLowerCase();
  await Token.update({ id: tokenAddress, data: { isPaused: true } });
});

ponder.on('PisoStablecoin:EmergencyUnpaused', async ({ event, context }) => {
  const { Token } = context.db;
  const tokenAddress = event.log.address.toLowerCase();
  await Token.update({ id: tokenAddress, data: { isPaused: false } });
});
