"use strict";

const { connect, mediaModel, saveUserModel } = require("../persistence/mongodb");
const { haveCredentials } = require("../utils/telegraf");

module.exports = {
  name: "settag",
  execute: async (context, args) => {
    try {
      haveCredentials(context);

      await connect();
      await saveUserModel(context);

      const [webContentLink, ...tags] = args;
      const media = await mediaModel.findOne({ webContentLink }).exec();
      if (!media) {
        return context.reply("media file not found!");
      }

      const { tags: originalTags } = media;
      const filteredTags = tags
        .map((tag) => tag.toLowerCase())
        .filter((tag) => tag.trim() !== "")
        .filter((tag) => !originalTags.includes(tag));

      if (!filteredTags.length) {
        return context.reply("no new tags for media file!");
      }

      await mediaModel
        .updateOne(
          { webContentLink },
          { $push: { tags: { $each: filteredTags } } }
        )
        .exec();

      return context.reply(`tags added: ${filteredTags.join(", ")}`);
    } catch (error) {
      console.error("command settag", error);
      const { message } = error;
      return context.replyWithMarkdown("`" + message + "`");
    }
  },
  description:
    "*BETA:* Set a new tags in media file to next finds using command `/pic` (usage: `/settag ulr_image tag tag ...tag`)",
};
