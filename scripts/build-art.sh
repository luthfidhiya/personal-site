#!/usr/bin/env bash
# Builds public/art/ from assets-src/ (see "Asset standard" in ART.md).
# Needs only ffmpeg. Run from anywhere: scripts/build-art.sh [stills|sequences]
# (no argument builds both)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets-src"
OUT="$ROOT/public/art"

# Green screen key by green dominance rather than one exact green: the generated greens
# vary from file to file, and a pale slash trail (green showing through white) goes too.
# Alpha falls off as green stops beating red and blue; the green left on edges is clamped.
KEY="format=rgba,geq=r='r(X,Y)':g='min(g(X,Y),max(r(X,Y),b(X,Y)))':b='b(X,Y)':a='clip(255-(g(X,Y)-max(r(X,Y),b(X,Y))-12)*10,0,255)'"
WEBP=(-c:v libwebp -quality 82 -compression_level 6)

# Box around what is left after keying (or around what is not black), as w:h:x:y.
# bbox looks at single pixels, so a thin cloud top or a blade tip is kept whole.
bbox() {
  local file=$1 probe=$2
  ffmpeg -hide_banner -i "$file" -vf "$probe,bbox=min_val=16" -f null - 2>&1 |
    grep -o 'crop=[0-9:]*' | tail -1 | cut -d= -f2
}

# build_still <scene> <source file> <name> <green|black|black-loop> <small width> <large width>
build_still() {
  local scene=$1 src=$2 name=$3 bg=$4 small=$5 large=$6
  local tmp box
  tmp="$(mktemp --suffix=.png)"
  mkdir -p "$OUT/$scene"
  if [[ $bg == green ]]; then
    ffmpeg -v error -y -i "$SRC/$scene/$src" -vf "$KEY" "$tmp"
    box=$(bbox "$tmp" "alphaextract,format=gray")
  else
    ffmpeg -v error -y -i "$SRC/$scene/$src" "$tmp"
    # Probe the red channel: dark red is near black in luma and would be cropped away
    box=$(bbox "$tmp" "format=gbrp,extractplanes=r")
  fi
  # black-loop: a strip that tiles downward (falling water); stacking it over its own
  # mirror makes the bottom meet the top exactly
  local loop=""
  [[ $bg == black-loop ]] && loop=",split[a][b];[b]vflip[c];[a][c]vstack"
  for w in "$small" "$large"; do
    ffmpeg -v error -y -i "$tmp" -vf "crop=$box,scale=$w:-2:flags=lanczos$loop" -frames:v 1 -update 1 \
      "${WEBP[@]}" "$OUT/$scene/$name-$w.webp"
  done
  rm -f "$tmp"
  echo "$scene/$name  crop $box"
}

# build_sequence <scene> <source video> <name> <start s> <end s> <small width> <fps>
# Frames keep the full video frame so every frame lines up; large = the video's own width.
# fps thins the clip to about 60 frames, enough for one new frame every ~20px of scroll.
build_sequence() {
  local scene=$1 src=$2 name=$3 start=$4 end=$5 small=$6 fps=$7
  local dir="$OUT/$scene/$name" raw
  raw="$(mktemp -d)"
  rm -rf "$dir" && mkdir -p "$dir/$small"
  # Decoding is quick; the key is per pixel and single threaded, so each frame gets its own
  # ffmpeg, one per core
  ffmpeg -v error -y -ss "$start" -to "$end" -i "$SRC/$scene/$src" -vf "fps=$fps" \
    -start_number 0 "$raw/%03d.png"
  export KEY OUT_DIR="$dir" SMALL="$small" WEBP_ARGS="${WEBP[*]}"
  find "$raw" -name '*.png' | xargs -P "$(nproc)" -I{} bash -c '
    f={}; n=$(basename "$f" .png)
    ffmpeg -v error -y -i "$f" -vf "$KEY" $WEBP_ARGS "$OUT_DIR/$n.webp"
    ffmpeg -v error -y -i "$OUT_DIR/$n.webp" -vf "scale=$SMALL:-2:flags=lanczos" $WEBP_ARGS "$OUT_DIR/$SMALL/$n.webp"'
  rm -rf "$raw"
  echo "$scene/$name  $(find "$dir" -maxdepth 1 -name '*.webp' | wc -l) frames"
}

ONLY=${1:-}
# Sources not generated yet are skipped, so the script can run while a scene is half done
# Sources are named without extension here; whichever of png, jpg, jpeg, mp4 exists is used
find_src() {
  local f
  for f in "$SRC/$1/$2".{png,jpg,jpeg,mp4}; do [[ -f $f ]] && { basename "$f"; return; }; done
  echo "$1/$2  missing, skipped" >&2
  return 1
}
still() {
  local file
  [[ $ONLY == sequences ]] && return
  file=$(find_src "$1" "$2") || return 0
  build_still "$1" "$file" "${@:3}"
}
sequence() {
  local file
  [[ $ONLY == stills ]] && return
  file=$(find_src "$1" "$2") || return 0
  build_sequence "$1" "$file" "${@:3}"
}

# --- hero ---
still hero hero-moon moon black 640 1280
still hero hero-cloud-1 cloud-1 green 960 1920
still hero hero-cloud-2 cloud-2 green 960 1920
still hero hero-ridge-far ridge-far green 960 1920
still hero hero-ridge-near ridge-near green 960 1920
still hero hero-branch branch green 960 1920
# The draw: a beat of stillness, the blade drawn out to the left and down, then raised
# overhead; the long hold that follows in the clip is left out
sequence hero hero-samurai samurai 1.4 6.4 960 12

# --- about ---
still about about-cliff cliff green 960 1920
still about about-falls falls black-loop 480 960
still about about-rocks rocks green 960 1920
still about about-figure figure green 480 960
still about about-front front green 960 1920
