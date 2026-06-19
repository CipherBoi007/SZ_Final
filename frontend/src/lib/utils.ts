export const formatDeliveryDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const ordinal = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  return `${dayName}, ${day}${ordinal(day)} ${monthName}`;
};

export const getColorCode = (colorName: string): string => {
  if (!colorName) return 'transparent';
  
  const normalized = colorName.toLowerCase().trim();
  
  const colorMap: Record<string, string> = {
    // Fashion & Common colors
    'navy plaid': '#000080',
    'brown plaid': '#8B4513',
    'red plaid': '#FF0000',
    'green plaid': '#008000',
    'blue plaid': '#0000FF',
    'black plaid': '#000000',
    'grey plaid': '#808080',
    'gray plaid': '#808080',
    'white plaid': '#FFFFFF',
    'yellow plaid': '#FFFF00',
    'orange plaid': '#FFA500',
    'purple plaid': '#800080',
    'pink plaid': '#FFC0CB',
    'olive green': '#808000',
    'mustard': '#FFDB58',
    'rust': '#b7410e',
    'burgundy': '#800020',
    'charcoal': '#36454F',
    'teal': '#008080',
    'maroon': '#800000',
    'peach': '#FFE5B4',
    'mint': '#3EB489',
    'lavender': '#E6E6FA',
    'coral': '#FF7F50',
    'khaki': '#C3B091',
    'magenta': '#FF00FF',
    'cyan': '#00FFFF',
    'cream': '#FFFDD0',
    'beige': '#F5F5DC',
    'tan': '#D2B48C',
    'navy': '#000080',
    'brown': '#8B4513',
    'white': '#FFFFFF',
    'black': '#000000',
    'grey': '#808080',
    'gray': '#808080',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'bronze': '#CD7F32',
    'copper': '#B87333',
    'rose gold': '#B76E79',
    'champagne': '#F7E7CE',
    'emerald': '#50C878',
    'sapphire': '#0F52BA',
    'ruby': '#E0115F',
    'amethyst': '#9966CC',
    'topaz': '#FFC87C',
    'turquoise': '#40E0D0',
    'aqua': '#00FFFF',
    'aquamarine': '#7FFFD4',
    'lilac': '#C8A2C8',
    'violet': '#EE82EE',
    'indigo': '#4B0082',
    'fuchsia': '#FF00FF',
    'crimson': '#DC143C',
    'scarlet': '#FF2400',
    'cherry': '#DE3163',
    'brick': '#B22222',
    'salmon': '#FA8072',
    'apricot': '#FBCEB1',
    'ochre': '#CC7722',
    'amber': '#FFBF00',
    'lemon': '#FFF700',
    'lime': '#00FF00',
    'forest green': '#228B22',
    'hunter green': '#355E3B',
    'jade': '#00A86B',
    'mint green': '#98FF98',
    'seafoam': '#9FE2BF',
    'cyan blue': '#00B7EB',
    'cobalt': '#0047AB',
    'royal blue': '#4169E1',
    'sky blue': '#87CEEB',
    'baby blue': '#89CFF0',
    'slate': '#708090',
    'steel blue': '#4682B4',
    'periwinkle': '#CCCCFF',
    'mauve': '#E0B0FF',
    'plum': '#DDA0DD',
    'eggplant': '#614051',
    'taupe': '#483C32',
    'sand': '#C2B280',
    'camel': '#C19A6B',
    'chestnut': '#954535',
    'chocolate': '#7B3F00',
    'mocha': '#493D26',
    'espresso': '#4B3621',
    'ivory': '#FFFFF0',
    'bone': '#E3DAC9',
    'off white': '#FAF9F6',
    'off-white': '#FAF9F6',
    'ash': '#B2BEB5',
    'platinum': '#E5E4E2',
    'pearl': '#EAE0C8',
    'denim': '#1560BD',
    'washed denim': '#5E86C1',
    'light blue': '#ADD8E6',
    'dark blue': '#00008B',
    'light green': '#90EE90',
    'dark green': '#006400',
    'light red': '#FFCCCB',
    'dark red': '#8B0000',
    'light grey': '#D3D3D3',
    'dark grey': '#A9A9A9',
    'light gray': '#D3D3D3',
    'dark gray': '#A9A9A9',
    'mustard yellow': '#FFDB58',
    'rose': '#FF007F',
    'neon pink': '#FF10F0',
    'neon green': '#39FF14',
    'neon yellow': '#DFFF00',
    'neon orange': '#FF5F1F',
    'sage': '#9DC183',
    'moss': '#8A9A5B',
    'pine': '#01796F',
    'slate grey': '#708090',
    'slate gray': '#708090',
    'anthracite': '#28282D',
  };

  if (colorMap[normalized]) return colorMap[normalized];

  const firstWord = normalized.split(' ')[0];
  if (colorMap[firstWord]) return colorMap[firstWord];

  return normalized.replace(/\s+/g, '');
};
