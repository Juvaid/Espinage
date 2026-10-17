#!/bin/zsh
# Contact sheet for reviewing a render: one frame every STEP seconds (default 1),
# tiled 6 across at 270 px wide, so a whole reel fits in one image to look at.
# Usage: review_sheet.sh render.mp4 out.png [step_seconds] [start_s] [end_s]
#   e.g. review_sheet.sh out/review.mp4 out/review/sheet.png 0.25 12 15   (4 fps across a transition)
set -e
IN="$1"; OUT="$2"; STEP="${3:-1}"; START="${4:-0}"; END="${5:-}"
[[ -z "$IN" || -z "$OUT" ]] && { echo "usage: $0 render.mp4 out.png [step] [start] [end]"; exit 1; }
# Duration from ffmpeg itself (ffprobe is not installed on every machine).
DUR=$(ffmpeg -hide_banner -i "$IN" 2>&1 | python3 -c "import re,sys;h,m,s=re.search(r'Duration: (\\d+):(\\d+):([\\d.]+)',sys.stdin.read()).groups();print(int(h)*3600+int(m)*60+float(s))")
[[ -z "$END" ]] && END="$DUR"
N=$(python3 -c "import math;print(max(1,math.ceil(($END-$START)/$STEP)))")
ROWS=$(( (N + 5) / 6 ))
mkdir -p "$(dirname "$OUT")"
ffmpeg -v error -y -ss "$START" -to "$END" -i "$IN" \
  -vf "fps=1/${STEP},scale=270:-2,tile=6x${ROWS}:padding=6:margin=6:color=0x202020" \
  -frames:v 1 "$OUT"
echo "$OUT  ($N frames, ${STEP}s apart from ${START}s; read left→right, top→bottom)"
