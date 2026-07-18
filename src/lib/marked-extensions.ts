import type { MarkedExtension, Token, TokenizerAndRendererExtension } from 'marked';

/**
 * A curated shortcode -> emoji map covering the examples from the Markdown Guide
 * plus the most common shortcodes. Unknown shortcodes are left untouched so they
 * render as plain text (e.g. `:something:`).
 */
const EMOJI: Record<string, string> = {
  smile: '😄', laughing: '😆', blush: '😊', smiley: '😃', relaxed: '☺️',
  wink: '😉', heart_eyes: '😍', joy: '😂', rofl: '🤣', sweat_smile: '😅',
  thinking: '🤔', neutral_face: '😐', unamused: '😒', sob: '😭', cry: '😢',
  angry: '😠', rage: '😡', sunglasses: '😎', grin: '😁', kissing_heart: '😘',
  heart: '❤️', broken_heart: '💔', blue_heart: '💙', green_heart: '💚',
  yellow_heart: '💛', purple_heart: '💜', orange_heart: '🧡', black_heart: '🖤',
  thumbsup: '👍', '+1': '👍', thumbsdown: '👎', '-1': '👎', ok_hand: '👌',
  clap: '👏', wave: '👋', pray: '🙏', muscle: '💪', point_up: '☝️',
  point_down: '👇', point_left: '👈', point_right: '👉', raised_hands: '🙌',
  fire: '🔥', star: '⭐', star2: '🌟', sparkles: '✨', zap: '⚡',
  boom: '💥', tada: '🎉', confetti_ball: '🎊', gift: '🎁', balloon: '🎈',
  rocket: '🚀', bulb: '💡', memo: '📝', pencil: '✏️', book: '📖',
  books: '📚', bookmark: '🔖', pushpin: '📌', paperclip: '📎', calendar: '📅',
  clipboard: '📋', chart_with_upwards_trend: '📈', chart_with_downwards_trend: '📉',
  bar_chart: '📊', mag: '🔍', lock: '🔒', unlock: '🔓', key: '🔑',
  gear: '⚙️', wrench: '🔧', hammer: '🔨', bug: '🐛', warning: '⚠️',
  no_entry: '⛔', no_entry_sign: '🚫', white_check_mark: '✅', heavy_check_mark: '✔️',
  x: '❌', question: '❓', exclamation: '❗', bangbang: '‼️', information_source: 'ℹ️',
  heavy_plus_sign: '➕', heavy_minus_sign: '➖', heavy_multiplication_x: '✖️',
  arrow_right: '➡️', arrow_left: '⬅️', arrow_up: '⬆️', arrow_down: '⬇️',
  hourglass: '⌛', watch: '⌚', alarm_clock: '⏰', hourglass_flowing_sand: '⏳',
  bell: '🔔', no_bell: '🔕', loudspeaker: '📢', mega: '📣', speech_balloon: '💬',
  thought_balloon: '💭', eyes: '👀', eye: '👁️', brain: '🧠', skull: '💀',
  ghost: '👻', alien: '👽', robot: '🤖', poop: '💩', hankey: '💩',
  sun: '☀️', sunny: '☀️', cloud: '☁️', umbrella: '☔', snowflake: '❄️',
  snowman: '⛄', ocean: '🌊', droplet: '💧', coffee: '☕', tea: '🍵',
  beer: '🍺', wine_glass: '🍷', pizza: '🍕', hamburger: '🍔', apple: '🍎',
  tent: '⛺', house: '🏠', office: '🏢', hospital: '🏥', school: '🏫',
  car: '🚗', taxi: '🚕', bus: '🚌', train: '🚆', airplane: '✈️',
  ship: '🚢', bike: '🚲', dog: '🐶', cat: '🐱', mouse: '🐭',
  rabbit: '🐰', bear: '🐻', panda_face: '🐼', tiger: '🐯', lion: '🦁',
  cow: '🐮', pig: '🐷', frog: '🐸', monkey: '🐵', chicken: '🐔',
  penguin: '🐧', bird: '🐦', fish: '🐟', whale: '🐳', dolphin: '🐬',
  snail: '🐌', bee: '🐝', ant: '🐜', spider: '🕷️', butterfly: '🦋',
  seedling: '🌱', evergreen_tree: '🌲', palm_tree: '🌴', cactus: '🌵',
  four_leaf_clover: '🍀', maple_leaf: '🍁', flower: '🌸', rose: '🌹',
  tulip: '🌷', sunflower: '🌻', earth_africa: '🌍', earth_americas: '🌎',
  earth_asia: '🌏', moon: '🌙', globe_with_meridians: '🌐', trophy: '🏆',
  medal: '🏅', dart: '🎯', game_die: '🎲', musical_note: '🎵', notes: '🎶',
  headphones: '🎧', guitar: '🎸', microphone: '🎤', movie_camera: '🎥',
  camera: '📷', phone: '📞', iphone: '📱', computer: '💻', desktop_computer: '🖥️',
  keyboard: '⌨️', printer: '🖨️', floppy_disk: '💾', cd: '💿', battery: '🔋',
  moneybag: '💰', dollar: '💵', credit_card: '💳', gem: '💎', crown: '👑',
  hourglass_done: '⌛', 100: '💯', ok: '🆗', new: '🆕', cool: '🆒',
  free: '🆓', up: '🆙', sos: '🆘', recycle: '♻️', checkered_flag: '🏁',
  triangular_flag_on_post: '🚩', envelope: '✉️', email: '📧', inbox_tray: '📥',
  outbox_tray: '📤', link: '🔗', label: '🏷️', hash: '#️⃣', asterisk: '*️⃣',
};

function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** `==highlighted text==` -> <mark> */
const highlight: TokenizerAndRendererExtension = {
  name: 'highlight',
  level: 'inline',
  start(src) {
    return src.indexOf('==');
  },
  tokenizer(src) {
    const match = /^==(?=\S)([\s\S]*?\S)==/.exec(src);
    if (match) {
      return {
        type: 'highlight',
        raw: match[0],
        tokens: this.lexer.inlineTokens(match[1]),
      };
    }
    return undefined;
  },
  renderer(token) {
    return `<mark>${this.parser.parseInline((token as { tokens: Token[] }).tokens)}</mark>`;
  },
};

/** `~subscript~` -> <sub>. Deliberately ignores `~~` so GFM strikethrough still works. */
const subscript: TokenizerAndRendererExtension = {
  name: 'subscript',
  level: 'inline',
  start(src) {
    return src.indexOf('~');
  },
  tokenizer(src) {
    const match = /^~(?!~)([^\s~]+?)~/.exec(src);
    if (match) {
      return {
        type: 'subscript',
        raw: match[0],
        tokens: this.lexer.inlineTokens(match[1]),
      };
    }
    return undefined;
  },
  renderer(token) {
    return `<sub>${this.parser.parseInline((token as { tokens: Token[] }).tokens)}</sub>`;
  },
};

/** `^superscript^` -> <sup> */
const superscript: TokenizerAndRendererExtension = {
  name: 'superscript',
  level: 'inline',
  start(src) {
    return src.indexOf('^');
  },
  tokenizer(src) {
    const match = /^\^([^\s^]+?)\^/.exec(src);
    if (match) {
      return {
        type: 'superscript',
        raw: match[0],
        tokens: this.lexer.inlineTokens(match[1]),
      };
    }
    return undefined;
  },
  renderer(token) {
    return `<sup>${this.parser.parseInline((token as { tokens: Token[] }).tokens)}</sup>`;
  },
};

/** `:shortcode:` -> emoji (only when the shortcode is known) */
const emoji: TokenizerAndRendererExtension = {
  name: 'emoji',
  level: 'inline',
  start(src) {
    return src.indexOf(':');
  },
  tokenizer(src) {
    const match = /^:([a-z0-9_+-]+):/.exec(src);
    if (match && EMOJI[match[1]]) {
      return {
        type: 'emoji',
        raw: match[0],
        text: EMOJI[match[1]],
      };
    }
    return undefined;
  },
  renderer(token) {
    return (token as unknown as { text: string }).text;
  },
};

type DefinitionListItem = {
  terms: Token[][];
  defs: Token[][];
};

/**
 * Definition lists:
 *
 *   Term
 *   : definition one
 *   : definition two
 *
 * Renders to <dl><dt>…</dt><dd>…</dd></dl>.
 */
const definitionList: TokenizerAndRendererExtension = {
  name: 'definitionList',
  level: 'block',
  start(src) {
    const match = /\n:[ \t]/.exec(src);
    return match ? match.index : undefined;
  },
  tokenizer(src) {
    const lines = src.split('\n');

    if (lines.length < 2 || !lines[0].trim() || lines[0].startsWith(':')) {
      return undefined;
    }

    if (!/^:[ \t]/.test(lines[1])) {
      return undefined;
    }

    const items: DefinitionListItem[] = [];
    let current: DefinitionListItem | null = null;
    const consumed: string[] = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];

      if (/^:[ \t]/.test(line)) {
        if (!current) {
          break;
        }
        current.defs.push(this.lexer.inlineTokens(line.replace(/^:[ \t]+/, '').trim()));
        consumed.push(line);
        index += 1;
        continue;
      }

      if (line.trim() === '') {
        const next = lines[index + 1];
        if (next && /^:[ \t]/.test(next)) {
          consumed.push(line);
          index += 1;
          continue;
        }
        break;
      }

      if (line.startsWith(':')) {
        break;
      }

      // A term line.
      if (current && current.defs.length > 0) {
        items.push(current);
        current = null;
      }
      if (!current) {
        current = { terms: [], defs: [] };
      }
      current.terms.push(this.lexer.inlineTokens(line.trim()));
      consumed.push(line);
      index += 1;
    }

    if (current && (current.terms.length > 0 || current.defs.length > 0)) {
      items.push(current);
    }

    const hasValidItem = items.some((item) => item.terms.length > 0 && item.defs.length > 0);
    if (!hasValidItem) {
      return undefined;
    }

    return {
      type: 'definitionList',
      raw: consumed.join('\n'),
      items,
    };
  },
  renderer(token) {
    const items = (token as unknown as { items: DefinitionListItem[] }).items;
    let html = '<dl>';

    for (const item of items) {
      for (const term of item.terms) {
        html += `<dt>${this.parser.parseInline(term)}</dt>`;
      }
      for (const def of item.defs) {
        html += `<dd>${this.parser.parseInline(def)}</dd>`;
      }
    }

    return `${html}</dl>`;
  },
};

export const extendedSyntax: MarkedExtension = {
  extensions: [highlight, subscript, superscript, emoji, definitionList],
};

export { escapeText };
