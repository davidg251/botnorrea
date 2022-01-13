"use strict";

const { connect, mediaModel, saveUserModel } = require("../persistence/mongodb");
const { haveCredentials } = require("../utils/telegraf");
const { setTags } = require("../utils/filemanager");

module.exports = {
  name: "settag",
  execute: async (context, args) => {
    try {
      haveCredentials(context);

      await connect();
      await saveUserModel(context);

      const [webContentLink, ...tags] = args;
      const tagsAdded = await setTags(webContentLink, tags);
      return context.reply(`tags added: ${tagsAdded.join(", ")}`);
    } catch (error) {
      console.error("command settag", error);
      const { message } = error;
      return context.replyWithMarkdown("`" + message + "`");
    }
  },
  description:
    "*BETA:* Set a new tags in media file to next finds using command `/pic` (usage: `/settag ulr_image tag tag ...tag`)",
};
