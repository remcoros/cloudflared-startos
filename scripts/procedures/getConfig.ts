import { compat, types as T } from "../deps.ts";

export const getConfig: T.ExpectedExports.getConfig = compat.getConfig({
  token: {
    type: "string",
    name: "Token",
    description: "The Cloudflare Tunnel Token.",
    nullable: false,
    masked: true,
    copyable: true,
  },
});
