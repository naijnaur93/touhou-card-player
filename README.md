# Touhou Card Player
Well, this one does as the name says, deployed by at [Github Pages](https://lightbulb128.github.io/touhou-card-player/).

I am a great fan of Alice Margatroid so I have a button placed at the page top which takes you to Alice's music!

Example *how-to-play* video uploaded at [Bilibili](https://www.bilibili.com/video/BV1JVzEYsEzF).

## For development

```bash
npm run dev
```

## For deployment
```bash
npm run build
npm run start
```

## Resources

This project is initially written for playing Touhou music-character card games. The card resources are already included in this repo. The music
used are linked from thwiki.cc. 

## How to add cards/songs or adapt to other music sets.

In short, you need to edit `public/data.json`, and add card images to the specific folders.

- Adding a new character: create a new key in `data` section of `public/data.json`, and add the card file name, music key and tags there. The music key should be a filename present in `public/music` folder, OR, if this key is in the `sources` section of `data.json`, it should point to a valid music file on the internet (e.g. thbwiki).
- Adding a new set of cards: in `public/musicIdSelectPanel.js`, you add a new entry in `cardStyleSet` const. ALL required cards should be present in the new cards folder.
- Switching to an entire new set of cards and musics
    - Apparently, you need to rewrite all the `public/data.json` and put the images correctly.
    - Additionally, you need to take a look at the `getMusicName` function in `public/utils.js` since there I have written some filename detection logic specific to touhou files as how I named them.
    - Finally, I have a *We need more Alice!* button on the page top. You might want to edit that too (remove it or put someone you are favourite there.)