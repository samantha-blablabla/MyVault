import { onRequest as __api_coingecko___path___js_onRequest } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\coingecko\\[[path]].js"
import { onRequest as __api_vndirect___path___js_onRequest } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\vndirect\\[[path]].js"
import { onRequestGet as __api_signals_ts_onRequestGet } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\signals.ts"
import { onRequestPost as __api_signals_ts_onRequestPost } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\signals.ts"
import { onRequestDelete as __api_transactions_ts_onRequestDelete } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\transactions.ts"
import { onRequestGet as __api_transactions_ts_onRequestGet } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\transactions.ts"
import { onRequestPost as __api_transactions_ts_onRequestPost } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\transactions.ts"
import { onRequestPut as __api_transactions_ts_onRequestPut } from "C:\\Users\\Admin\\OneDrive\\Máy tính\\My Vault\\functions\\api\\transactions.ts"

export const routes = [
    {
      routePath: "/api/coingecko/:path*",
      mountPath: "/api/coingecko",
      method: "",
      middlewares: [],
      modules: [__api_coingecko___path___js_onRequest],
    },
  {
      routePath: "/api/vndirect/:path*",
      mountPath: "/api/vndirect",
      method: "",
      middlewares: [],
      modules: [__api_vndirect___path___js_onRequest],
    },
  {
      routePath: "/api/signals",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_signals_ts_onRequestGet],
    },
  {
      routePath: "/api/signals",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_signals_ts_onRequestPost],
    },
  {
      routePath: "/api/transactions",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_transactions_ts_onRequestDelete],
    },
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
  {
      routePath: "/api/transactions",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_transactions_ts_onRequestPut],
    },
  ]