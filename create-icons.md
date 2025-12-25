# Creating Extension Icons

The extension requires three icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can create these using any image editor or online tool. The icons should represent a clock or calendar to match the attendance tracking theme.

For now, you can use placeholder images or create simple colored squares with text.

To create simple placeholder icons, you can use ImageMagick:

```bash
# Create 16x16 icon
convert -size 16x16 xc:#667eea -pointsize 10 -fill white -gravity center -annotate +0+0 "BJ" icon16.png

# Create 48x48 icon
convert -size 48x48 xc:#667eea -pointsize 30 -fill white -gravity center -annotate +0+0 "BJ" icon48.png

# Create 128x128 icon
convert -size 128x128 xc:#667eea -pointsize 80 -fill white -gravity center -annotate +0+0 "BJ" icon128.png
```

Or use any online icon generator and save them in the project root directory.

