type AccountError = import("./errors").AccountError

type CurrencyRatio = number & { readonly brand: unique symbol }
type AccountLevel =
  typeof import("./index").AccountLevel[keyof typeof import("./index").AccountLevel]

type AccountStatus =
  typeof import("./index").AccountStatus[keyof typeof import("./index").AccountStatus]

type DepositFeeRatio = number & { readonly brand: unique symbol }
type WithdrawFee = number & { readonly brand: unique symbol }

type ContactAlias = string & { readonly brand: unique symbol }

type AccountContact = {
  readonly id: Username
  readonly username: Username
  alias: ContactAlias
  transactionsCount: number
}

type Account = {
  readonly id: AccountId
  readonly createdAt: Date
  username: Username
  readonly defaultWalletId: WalletId
  readonly ownerId: UserId
  readonly depositFeeRatio: DepositFeeRatio
  readonly withdrawFee: WithdrawFee
  level: AccountLevel
  status: AccountStatus
  readonly walletIds: WalletId[]
  title: BusinessMapTitle
  coordinates: Coordinates
  readonly contacts: AccountContact[]
}

type Currencies = {
  id: Currency
  ratio: CurrencyRatio
}[]

type BusinessMapTitle = string & { readonly brand: unique symbol }
type Coordinates = {
  longitude: number
  latitude: number
}

type BusinessMapInfo = {
  title: BusinessMapTitle
  coordinates: Coordinates
}

type BusinessMapMarker = {
  username: Username
  mapInfo: BusinessMapInfo
}

type LimitsChecker = {
  checkTwoFA({
    amount,
    walletVolume,
  }: {
    amount: Satoshis
    walletVolume: TxVolume
  }): true | LimitsExceededError
  checkIntraledger({
    amount,
    walletVolume,
  }: {
    amount: Satoshis
    walletVolume: TxVolume
  }): true | LimitsExceededError
  checkWithdrawal({
    amount,
    walletVolume,
  }: {
    amount: Satoshis
    walletVolume: TxVolume
  }): true | LimitsExceededError
}

interface IAccountsRepository {
  listUnlockedAccounts(): Promise<Account[] | RepositoryError>
  findById(accountId: AccountId): Promise<Account | RepositoryError>
  findByUserId(userId: UserId): Promise<Account | RepositoryError>
  findByWalletId(walletId: WalletId): Promise<Account | RepositoryError>
  findByUsername(username: Username): Promise<Account | RepositoryError>
  listBusinessesForMap(): Promise<BusinessMapMarker[] | RepositoryError>
  update(account: Account): Promise<Account | RepositoryError>
}

type TestAccount = {
  phone: PhoneNumber
  code: PhoneCode
  username: Username | undefined
  role: string | undefined // FIXME
}

type TestAccountsChecker = (testAccounts: TestAccount[]) => {
  isPhoneValid: (phone: PhoneNumber) => boolean
  isPhoneAndCodeValid: ({
    code,
    phone,
  }: {
    code: PhoneCode
    phone: PhoneNumber
  }) => boolean
}
