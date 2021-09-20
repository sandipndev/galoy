import { getTwoFALimits, getUserLimits, MS_PER_DAY } from "@config/app"
import { LimitsChecker } from "@domain/accounts"
import { toSats } from "@domain/bitcoin"
import { toLiabilitiesAccountId } from "@domain/ledger"
import { TwoFA, TwoFANewCodeNeededError } from "@domain/twoFA"
import { LedgerService } from "@services/ledger"
import { AccountsRepository } from "@services/mongoose"

export const getLimitsChecker = async (
  walletId: WalletId,
): Promise<LimitsChecker | ApplicationError> => {
  const ledgerService = LedgerService()

  const liabilitiesAccountId = toLiabilitiesAccountId(walletId)
  const timestamp1Day = (Date.now() - MS_PER_DAY) as UnixTimeMs
  const walletVolume = await ledgerService.txVolumeSince({
    liabilitiesAccountId,
    timestamp: timestamp1Day,
  })
  if (walletVolume instanceof Error) return walletVolume

  const account = await AccountsRepository().findByWalletId(walletId)
  if (account instanceof Error) return account
  const { level } = account

  const userLimits = getUserLimits({ level })
  const twoFALimits = getTwoFALimits()
  return LimitsChecker({
    walletVolume,
    userLimits,
    twoFALimits,
  })
}

export const checkTwoFA = async ({
  amount,
  twoFAToken,
  twoFASecret,
  limitsChecker,
}: {
  amount: Satoshis
  twoFAToken: TwoFAToken
  twoFASecret: TwoFASecret
  limitsChecker: LimitsChecker
}): Promise<void | ApplicationError> => {
  const twoFALimitCheck = limitsChecker.checkTwoFA({
    pendingAmount: toSats(amount),
  })
  if (!(twoFALimitCheck instanceof Error)) return

  if (!twoFAToken) return new TwoFANewCodeNeededError()

  const validTwoFA = TwoFA().verify({
    secret: twoFASecret,
    token: twoFAToken as TwoFAToken,
  })
  if (validTwoFA instanceof Error) return validTwoFA
}
