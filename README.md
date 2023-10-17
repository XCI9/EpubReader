# EpubReader

A browser base epub reader. Epub is an e-book file format, which is widely used. 
The term is short for Electronic PUBlication. 
The reader allow you to easily read epub book on computer browser and have many custom setting.

# Requirement
### Epub
work on Epub 1.0, 2.0 are not tested.
### Python
Require Python 3.8+
### Requirement
No extra package are needed.

# How to use
1. Prepare your epub file
2. Drag the file directly onto to `main.py`, the program will parse the epub file and open the book on the default browser
3. Enjoy you book

# Reader settings and functions in browser
There are many feature implement in this reader.
- On the left top, you can open the outline panel of this book, you can jump to the place you last read.
- On the right top, you can open the setting panel, there are many setting, you can change the font size, font color, background color, line height, etc.
   If you are familiar with css, you can also custom the advance setting use the custom css input box.
- On page mode, you can use `←`、`→` key to turn prev page and next page
- On continuous mode, you can use wheel to scroll (on vertical mode, `shift` + wheel) and `←`、`→` keys to change chapter.
- For images, click on it can open image on fullscreen, and under this mode, you can use wheel to zoom the image and you can also drag the image or rotate it.
- Since the reader serves using the socket server, you can also use other devices to connect to this server and read the book on other devices. 
