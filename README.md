# vincent0700-cli

This is an experimental cli tool to show my profile. Welcome!

## ▩ Usage

> Tips: You must have NodeJs environment to run this command.

```javascript
$ npx vincent0700-cli
```

I have tested it successfully on my macOS terminal. If you're on Windows, perhaps you need to use [Windows Terminal](https://github.com/microsoft/terminal) instead of cmd.exe.

It's just experimental and don't be too critical (ノへ￣、) If you can't use it, don't be worry. You can also find me through [Telegram](https://t.me/vincent0700) and [Gmail](mailto:wang.yuanqiu007@gmail.com).

## ▩ Preview

[![](./demo.gif)](https://asciinema.org/a/BiZMPXylayQIftIJeR1uXdxBe)

## ▩ How it works

I have serialized each frame of the GIF and saved it as binary file. Then I use url-loader to load each frame and put base64 data into source file. So that i don't need to package image libs into my bundle to parse gif at runtime. It only depends on [chalk](https://github.com/chalk/chalk). So the next step is to render frame by frame.

I use `process.stdout.cursorTo(0, 0)` to draw each frame instead of `console.clear()` to fixed screen splash while repainting. Here is the wiki:

- [Node.js Documentation - TTY](https://nodejs.org/api/tty.html)
