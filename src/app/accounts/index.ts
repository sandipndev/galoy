import { RepositoryError } from "@domain/errors"
import { AccountsRepository, WalletsRepository } from "@services/mongoose"

export const getAccount = async (accountId: AccountId) => {
  const accounts = AccountsRepository()
  return accounts.findById(accountId)
}

export const hasPermissions = async (
  userId: UserId,
  walletName: WalletName,
): Promise<boolean | ApplicationError> => {
  const accounts = AccountsRepository()

  const userAccounts = await accounts.listByUserId(userId)
  if (userAccounts instanceof Error) return userAccounts

  const walletAccount = await accounts.findByWalletName(walletName)
  if (walletAccount instanceof Error) return walletAccount

  return userAccounts.some((a) => a.id === walletAccount.id)
}

export const getBusinessMapMarkers = async () => {
  const accounts = AccountsRepository()
  return accounts.listBusinessesForMap()
}

export const toWalletIds = async (
  account: Account,
  walletNames: WalletName[],
): Promise<WalletId[] | ApplicationError> => {
  const wallets = WalletsRepository()

  const walletIds: WalletId[] = []

  for (const walletName of walletNames) {
    const wallet = await wallets.findByWalletName(walletName)
    if (wallet instanceof Error) {
      return wallet
    }

    if (!account.walletIds.includes(wallet.id)) {
      return new RepositoryError()
    }
    walletIds.push(wallet.id)
  }

  return walletIds
}
