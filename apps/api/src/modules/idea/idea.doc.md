# Как ideas генерируются в этой модели

## Case A — from selected notes

Input:
- selected notes
- optional selected theme
- optional active strategy
- selected/default voice

Output:
- ideas[]

## Case B — from theme

Input:
- theme
- notes retrieved by confirmed/suggested links
- optional strategy
- voice 

Output:
- angles[] and/or ideas[]

## Case C — from strategy

Input:
- strategy snapshot
- active themes
- optional supporting notes
- voice

Output:
- angles[]
- optional ideas[]