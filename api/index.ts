import { Bot, Context, webhookCallback } from "grammy";

const TOKEN = process.env.TOKEN as string;

const RE_TWITTER = /^https:\/\/twitter.com\/[^\/]+\/status\/(\d+)/;

const THREAD_READER_URL = "https://threadreaderapp.com/thread/ID.html";
const THREAD_READER_A = '<a href="URL">URL</a>';

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
  const threadIds = urls.flatMap((url) => {
    const match = url.match(RE_TWITTER);
    return match ? match[1] : [];
  });
  const threadReaderUrls = threadIds.map((id) =>
    THREAD_READER_URL.replace(/ID/g, id)
  );
  const threadReaderMessage = threadReaderUrls
    .map((url) => THREAD_READER_A.replace(/URL/g, url))
    .join("\n");
  return context.reply(threadReaderMessage, {
    reply_to_message_id: context.message.message_id,
    parse_mode: "HTML",
  });
}
