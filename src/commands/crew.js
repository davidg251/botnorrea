"use strict";

const { connect, saveUserModel, crewModel } = require("../persistence/mongodb");
const {
  haveCredentials,
  getMessageId,
  isEnabled,
} = require("../utils/telegraf");
const { trackCommand } = require("../utils/mixpanel");

const CURRENT_COMMAND = "crew";

module.exports = {
  name: CURRENT_COMMAND,
  execute: async ({ context, args }) => {
    const extra = getMessageId(context);

    try {
      haveCredentials(context);

      await connect();
      await saveUserModel(context);

      await isEnabled(CURRENT_COMMAND);
      trackCommand(CURRENT_COMMAND, context);

      const [crewName, ...rawMessage] = args;
      const crew = await crewModel.findOne({ name: crewName }).exec();
      if (!crew) {
        return context.reply("crew not found!", extra);
      }
      const { members } = crew;
      if (!members || members.length === 0) {
        return context.reply("members not found!", extra);
      }

      const usernames = members
        .map(({ username }) => `@${username}`)
        .join(" | ");

      const message = rawMessage.join(" ");

      return context.replyWithHTML(
        `${crewName}:\n\n<b>${message}</b>\n\n[ ${usernames} ]`,
        extra
      );
    } catch (error) {
      const { message } = error;
      return context.replyWithMarkdown("`" + message + "`", extra);
    }
  },
  description: "Invoke a crews members (usage: `/crew crew_name`)",
};
