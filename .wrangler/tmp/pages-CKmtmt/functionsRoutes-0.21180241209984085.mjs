import { onRequestGet as __api_transactions_ts_onRequestGet } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\transactions.ts"
import { onRequestPost as __api_transactions_ts_onRequestPost } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\transactions.ts"

export const routes = [
    {
      routePath: "/api/transactions",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_transactions_ts_onRequestGet],
    },
  {
      routePath: "/api/transactions",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_transactions_ts_onRequestPost],
    },
  ]