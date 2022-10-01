import { Bot, Context, webhookCallback } from "grammy";

const TOKEN = process.env.TOKEN as string;

const TWITTER = "https://twitter.com";
const NITTER = "https://nitter.it";
const HREF = '<a href="URL">URL</a>';

const bot = new Bot(TOKEN);

bot.on("::url", handleTwitterLinks);

export default webhookCallback(bot, "http");

function handleTwitterLinks(context: Context) {
  if (!context.message) return;
  const text = context.message.text ?? "";
  const entities = context.message.entities ?? [];
  const urls = entities.flatMap((e) => {
    if (e.type === "url")
      return [text.substring(e.offset, e.offset + e.length)];
    if (e.type === "text_link") return [e.url];
    return [];
  });
  const twitters = urls.flatMap((url) =>
    url.startsWith(TWITTER) ? [url] : []
  );
  if (twitters.length) {
    const message = twitters
      .map((url) => HREF.replace(/URL/g, url.replace(TWITTER, NITTER)))
      .join("\n");
    return context.reply(message, {
      reply_to_message_id: context.message.message_id,
      parse_mode: "HTML",
    });
  }
}
