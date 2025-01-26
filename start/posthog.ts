import posthog from "#services/posthog_service";
import app from "@adonisjs/core/services/app";

app.terminating(async () => {
  await posthog.client?.shutdown()
})
