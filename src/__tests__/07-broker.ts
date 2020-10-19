/**
 * @jest-environment node
 */
import { setupMongoConnection } from "../mongodb"
import { BrokerWallet } from "../BrokerWallet";
import { baseLogger } from "../utils";
import { quit } from "../lock";
import { getTokenFromPhoneIndex } from "../walletFactory";
const mongoose = require("mongoose");
const util = require('util')

const fixtures = [{
  privateGetAccount: function() {
    return new Promise((resolve, reject) => {
      resolve({
        result: {
          marginFraction: null,
          chargeInterestOnNegativeUsd: true,
          collateral: 0,
          positions: [],

        },
      success: true
    })
  })},
  createMarketBuyOrder: () => ({ }),
  getBalance: () => ({
    info: {
      result: [],
      success: true
    },
    USDT: { free: 0, used: 0, total: 0 },
    USD: { free: 0.0000123, used: 0.002345, total: 0.0001234},
    BTC: { free: 0.005430, used: 0, total: 0.005430 },
    free: { USDT: 0, USD: 0.002345, BTC: 0.005430 },
    used: { USDT: 0, USD: 0.001234, BTC: 0 },
    total: { USDT: 0, USD: 0.002345, BTC: 0.005430 }
  })
}, {
  privateGetAccount: function() {
    return new Promise((resolve, reject) => {
      resolve({
        result: {
          backstopProvider: false,
          chargeInterestOnNegativeUsd: true,
          collateral: 90.1234,
          freeCollateral: 80.1234,
          initialMarginRequirement: 0.05,
          leverage: 20,
          liquidating: false,
          maintenanceMarginRequirement: 0.03,
          makerFee: 0,
          marginFraction: 0.495,
          openMarginFraction: 0.472,
          positionLimit: null,
          positionLimitUsed: null,
          positions: [{
            collateralUsed: 0.328866663378,
            cost: -0.9872,
            entryPrice: 9872,
            estimatedLiquidationPrice: 0,
            future: 'BTC-PERP',
            initialMarginRequirement: 0.33333333,
            longOrderSize: 0,
            maintenanceMarginRequirement: 0.03,
            netSize: -0.0001,
            openSize: 0.0001,
            realizedPnl: -0.01195,
            shortOrderSize: 0,
            side: 'sell',
            size: 0.0001,
            unrealizedPnl: 0.0006
          }],
          spotLendingEnabled: false,
          spotMarginEnabled: false,
          takerFee: 0.0007,
          totalAccountValue: 96.06484715052996,
          totalPositionSize: 202.1541,
          useFttCollateral: true
      },
      success: true
    })
  })},
  createMarketBuyOrder: () => ({
    result: {
      info: {
        avgFillPrice: 9892.5,
        clientId: null,
        createdAt: '2020-06-23T00:00:58.777148+00:00',
        filledSize: 0.0001,
        future: 'BTC-PERP',
        id: 6103637365,
        ioc: true,
        liquidation: false,
        market: 'BTC-PERP',
        postOnly: false,
        price: null,
        reduceOnly: false,
        remainingSize: 0,
        side: 'buy',
        size: 0.0001,
        status: 'closed',
        type: 'market'
      },
      id: '6103637365',
      clientOrderId: undefined,
      timestamp: 1592870458777,
      datetime: '2020-06-23T00:00:58.777Z',
      lastTradeTimestamp: undefined,
      symbol: 'BTC-PERP',
      type: 'market',
      side: 'buy',
      price: 9892.5,
      amount: 0.0001,
      cost: 0.9892500000000001,
      average: 9892.5,
      filled: 0.0001,
      remaining: 0,
      status: 'closed',
      fee: undefined,
      trades: undefined
    }
  }),
  getBalance: () => ({
    info: {
      result: [
        { coin: 'USDT', free: 0, total: 0, usdValue: 5.0001234-9 },
        {
          coin: 'USD',
          free: 0.0000123,
          total: 0.0004567,
          usdValue: 0.000789,
        },
        {
          coin: 'BTC',
          free: 0.005430,
          total: 0.005430934,
          usdValue: 50.12345
        }
      ],
      success: true
    },
    USDT: { free: 0, used: 0, total: 0 },
    USD: { free: 0.0000123, used: 0.002345, total: 0.0001234},
    BTC: { free: 0.005430, used: 0, total: 0.005430 },
    free: { USDT: 0, USD: 0.002345, BTC: 0.005430 },
    used: { USDT: 0, USD: 0.001234, BTC: 0 },
    total: { USDT: 0, USD: 0.002345, BTC: 0.005430 }
  })
}]


const createMarketBuyOrderError = {error: "Size too small", success: false}

const ftxHas = {
  cancelAllOrders: true,
  cancelOrder: true,
  cancelOrders: false,
  CORS: false,
  createDepositAddress: false,
  createLimitOrder: true,
  createMarketOrder: true,
  createOrder: true,
  deposit: false,
  editOrder: 'emulated',
  fetchBalance: true,
  fetchBidsAsks: false,
  fetchClosedOrders: false,
  fetchCurrencies: true,
  fetchDepositAddress: true,
  fetchDeposits: true,
  fetchFundingFees: false,
  fetchL2OrderBook: true,
  fetchLedger: false,
  fetchMarkets: true,
  fetchMyTrades: true,
  fetchOHLCV: true,
  fetchOpenOrders: true,
  fetchOrder: true,
  fetchOrderBook: true,
  fetchOrderBooks: false,
  fetchOrders: true,
  fetchOrderTrades: false,
  fetchStatus: 'emulated',
  fetchTicker: true,
  fetchTickers: true,
  fetchTime: false,
  fetchTrades: true,
  fetchTradingFee: false,
  fetchTradingFees: true,
  fetchTradingLimits: false,
  fetchTransactions: false,
  fetchWithdrawals: true,
  privateAPI: true,
  publicAPI: true,
  withdraw: true
}


const ccxt = require('ccxt')

const ftxMock = jest.fn();

// fixtures.forEach()

let uid 

ftxMock.mockReturnValueOnce(fixtures[1]).mockReturnValueOnce(fixtures[0]);

jest.mock('ccxt', () => ({
  ftx: function() { return ftxMock() } 
}))

let brokerWalletFixture0, brokerWalletFixture1

beforeAll(async () => {
  await setupMongoConnection();

  ({ uid } = await getTokenFromPhoneIndex(7))

  brokerWalletFixture0 = new BrokerWallet({ uid, logger: baseLogger })
  brokerWalletFixture1 = new BrokerWallet({ uid, logger: baseLogger })
})

afterAll(async () => {
  await mongoose.connection.close()
  await quit()
})

it('future0', async () => {
  const future = await brokerWalletFixture0.getAccountPosition()
  console.log({future})
})

it('future1', async () => {
  const future = await brokerWalletFixture1.getAccountPosition()
  console.log({future})
})

it('getBalance', async () => {
  await brokerWalletFixture1.getBalance()
})

// it('getFunding', async () => {
//   const brokerWalletNofixtures = new BrokerWallet({ uid, logger: baseLogger })

//   console.log(await brokerWalletNofixtures.getNextFundingRate())
// })
