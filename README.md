# Rollover

Rollover is an [esolang](https://en.wikipedia.org/wiki/Esoteric_programming_language) created by [Scratch_Fakemon](https://scratchfakemon.github.io/).

## Commands

Rollover has seven commands, which are:
- `n`: moves to the next cell
- `i`: increments the current cell's value
- `c[]`: loops the code inside the brackets until the value of the cell equals the cell's index
- `p`: prints the current cell's value as a number
- `a`: prints the current cell's value as an ASCII character
- `u`: prints the current cell's value as a UTF-8 character
- `g`: gets a numerical input from the user and places it in the current cell

## Limits

Rollover has 256 cells, which have numeric values from 0 to 255 (similar to C's `uint8_t`).

Due to Rollover having no decrement commands, the only way to make the current cell or its value go down is to have it *roll over* when it exceeds the limit.

## Resources

- https://esolangs.org/wiki/Rollover, the page for Rollover on the Esolangs wiki
- https://scratchfakemon.github.io/rollover, the official Rollover page
- https://pid-j.github.io/rollover, an unofficial fork of the Rollover page with *extended features.*
