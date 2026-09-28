#This can be pasted directly into VSC
#!/usr/bin/env python3
"""
matrix_rain.py

"""

import os, random, shutil, sys, time
#import random
#import shutil
#import sys
#import time

HIDE_CURSOR = "\033[?25l"
SHOW_CURSOR = "\033[?25h"
CLEAR_SCREEN = "\033[2J"
HOME = "\033[H" 

def move_to(row: int, col: int) -> str:
    """Return the escape code to move the cursor to (row, col), 1-indexed."""
    return f"\033[{row};{col}H"

def rgb(r: int, g: int, b: int) -> str:
    """24-bit ("true color") foreground color escape code."""
    return f"\033[38;2;{r};{g};{b}m"

RESET = "\033[0m"
GLYPHS = {
    "01アイウエオカキクケコサシスセソタチツテト&%^')@" \ 
         "0123456789ABCDEF!@#$%^&*"     
} #Change your characters right here

def random_glyph() -> str:
    return random.choice(GLYPHS)


class Column:
    """
    It falls like a drop in a single column, then combines all the columns.

    head        -- current row of the brightest (leading) character
    length      -- how many characters trail behind the head
    speed       -- rows advanced per frame (float allows for varied fall rates)
    progress    -- fractional row accumulator, since speed can be < 1
    """

    def __init__(self, col: int, height: int):
        self.col = col
        self.height = height
        self.reset(randomize_start=True)

    def reset(self, randomize_start: bool = False):
        self.length = random.randint(5, height_bias(self.height))
        self.speed = random.uniform(0.4, 1.2)
        self.progress = random.uniform(-self.height, 0) if randomize_start else 0.0
        self.head = int(self.progress)
        self.glyphs = [random_glyph() for _ in range(self.length)]         #re-randomize every frame (occasionally, for a flicker effect)

    def step(self):
        self.progress += self.speed
        self.head = int(self.progress)            #random glyph mutate - flicker effect
        if random.random() < 0.15:
            idx = random.randrange(self.length)
            self.glyphs[idx] = random_glyph()     #start of a new drop.
        if self.head - self.length > self.height:
            self.reset()

    def render(self, buf: list):
        """Write this column's visible characters into the frame buffer."""
        for i in range(self.length):
            row = self.head - i
            if 1 <= row <= self.height:
                if i == 0:
                    color = rgb(200, 255, 200)               #Leading character: white for contrast
                else:
                    fade = max(0.0, 1.0 - i / self.length)   #Trail fades from bright green to dark green
                    g = int(60 + fade * 195)
                    color = rgb(0, g, 0)
                buf.append(f"{move_to(row, self.col)}{color}{self.glyphs[i]}{RESET}")


def height_bias(height: int) -> int:
    """Max trail length scales with terminal height, capped for sanity lmao"""
    return max(6, min(height, 25))


def main():
    term = shutil.get_terminal_size(fallback=(80, 24))
    width, height = term.columns, term.lines - 1     #leave the last line clear

    columns = [Column(c, height) for c in range(1, width + 1)]

    out = sys.stdout
    out.write(HIDE_CURSOR + CLEAR_SCREEN + HOME)
    out.flush()

    try:
        while True:
            frame = []
            for c in columns:
                c.step()
                c.render(frame)
            out.write("".join(frame))
            out.flush()
            time.sleep(0.05)  # ~20 fps
    except KeyboardInterrupt:
        pass
    finally:
        out.write(RESET + CLEAR_SCREEN + HOME + SHOW_CURSOR)         #Always restore the terminal, even if interrupted mid-frame.
        out.flush()


if __name__ == "__main__":
    main()
