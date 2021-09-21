import { GT } from "@graphql/index"

import MeQuery from "@graphql/root/query/me"
import GlobalsQuery from "@graphql/root/query/globals"
import WalletNameAvailableQuery from "@graphql/root/query/wallet-name-available"
import BusinessMapMarkersQuery from "@graphql/root/query/business-map-markers"
import MobileVersionsQuery from "@graphql/root/query/mobile-versions"
import QuizQuestionsQuery from "@graphql/root/query/quiz-questions"
import BtcPriceListQuery from "@graphql/root/query/btc-price-list"
import AccountApiKeysQuery from "@graphql/root/query/account-api-keys"

const QueryType = new GT.Object({
  name: "Query",
  fields: () => ({
    globals: GlobalsQuery,
    me: MeQuery,
    walletNameAvailable: WalletNameAvailableQuery,
    businessMapMarkers: BusinessMapMarkersQuery,
    mobileVersions: MobileVersionsQuery,
    quizQuestions: QuizQuestionsQuery,
    btcPriceList: BtcPriceListQuery,
    accountApiKeys: AccountApiKeysQuery,
  }),
})

export default QueryType
