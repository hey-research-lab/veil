import base64
import os
import re
import subprocess
from PIL import Image

def build_banner():
    # 1. Read base64 font
    font_path = "public/assets/fonts/GT-Alpina-Typewriter-Regular-Trial.otf"
    font_b64 = ""
    if os.path.exists(font_path):
        with open(font_path, "rb") as f:
            font_b64 = base64.b64encode(f.read()).decode("utf-8")

    # 2. Extract VeilLogo and VeilMark SVG from components/VeilLogo.tsx
    with open("components/VeilLogo.tsx", "r", encoding="utf-8") as f:
        logo_ts = f.read()

    # Extract VeilMark SVG
    vm_match = re.search(r'export const VeilMark.*?return \((.*?)\);', logo_ts, re.DOTALL)
    if not vm_match:
        raise Exception("Could not find VeilMark in VeilLogo.tsx")
    veil_mark_svg = vm_match.group(1).strip()
    veil_mark_svg = veil_mark_svg.replace('className={className}', '')
    veil_mark_svg = veil_mark_svg.replace('style={{', '').replace('}}', '')
    veil_mark_svg = veil_mark_svg.replace('aria-hidden="true"', '')
    veil_mark_svg = veil_mark_svg.replace('color,', '').replace('...style,', '')
    veil_mark_svg = veil_mark_svg.replace('display: "inline-block",', '')
    veil_mark_svg = veil_mark_svg.replace('verticalAlign: "middle",', '')
    veil_mark_svg = veil_mark_svg.replace('flexShrink: 0,', '')
    veil_mark_svg = veil_mark_svg.replace('width={size}', 'width="280"')
    veil_mark_svg = veil_mark_svg.replace('height={size}', 'height="280"')
    veil_mark_svg = veil_mark_svg.replace('{color}', '#1a1a1a')
    veil_mark_svg = veil_mark_svg.replace('{accentColor}', '#FF8A00')

    # Extract VeilLogo full wordmark SVG
    vl_match = re.search(r'const svgContent = \((.*?)\);', logo_ts, re.DOTALL)
    if not vl_match:
        raise Exception("Could not find svgContent in VeilLogo.tsx")
    veil_logo_svg = vl_match.group(1).strip()
    veil_logo_svg = veil_logo_svg.replace('width={resolvedWidth}', 'width="176"')
    veil_logo_svg = veil_logo_svg.replace('height={resolvedHeight}', 'height="49"')
    veil_logo_svg = veil_logo_svg.replace('{color}', '#1a1a1a')
    veil_logo_svg = veil_logo_svg.replace('{dotColor}', '#FF8A00')
    veil_logo_svg = veil_logo_svg.replace('className={className}', '')
    veil_logo_svg = veil_logo_svg.replace('style={{', '').replace('}}', '')
    veil_logo_svg = veil_logo_svg.replace('aria-label={ariaLabel}', '')
    veil_logo_svg = veil_logo_svg.replace('role="img"', '')
    veil_logo_svg = veil_logo_svg.replace('color,', '').replace('...style,', '')
    veil_logo_svg = veil_logo_svg.replace('display: "inline-block",', '')
    veil_logo_svg = veil_logo_svg.replace('verticalAlign: "middle",', '')
    veil_logo_svg = veil_logo_svg.replace('flexShrink: 0,', '')

    # Read Robinhood logo SVG
    with open("public/assets/logo/robinhood.svg", "r", encoding="utf-8") as f:
        rh_svg = f.read().strip()
    rh_svg = rh_svg.replace('width="831"', 'width="96"').replace('height="163"', 'height="19"')

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @font-face {{
    font-family: 'GT Alpina Typewriter';
    src: url('data:font/opentype;base64,{font_b64}') format('opentype');
    font-weight: 400;
    font-style: normal;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    width: 1200px;
    height: 630px;
    background-color: #EBE1F0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1a1a1a;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    -webkit-font-smoothing: antialiased;
  }}

  /* Micro-grid background pattern echoing paper / drafting grid */
  .grid-bg {{
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(26, 26, 26, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(26, 26, 26, 0.04) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    z-index: 1;
  }}

  /* Subtle warm ambient wash */
  .halftone-glow {{
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 560px;
    height: 560px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 138, 0, 0.09) 0%, rgba(235, 225, 240, 0) 70%);
    pointer-events: none;
    z-index: 1;
  }}

  /* Outer architectural frame */
  .card-frame {{
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(26, 26, 26, 0.16);
    border-radius: 12px;
    background: rgba(235, 225, 240, 0.82);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 38px 46px;
  }}

  /* Frame corner crosses */
  .corner-mark {{
    position: absolute;
    font-family: monospace;
    font-size: 14px;
    color: rgba(26, 26, 26, 0.3);
    line-height: 1;
    pointer-events: none;
  }}
  .corner-tl {{ top: 8px; left: 10px; }}
  .corner-tr {{ top: 8px; right: 10px; }}
  .corner-bl {{ bottom: 8px; left: 10px; }}
  .corner-br {{ bottom: 8px; right: 10px; }}

  /* Header */
  .header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(26, 26, 26, 0.1);
    padding-bottom: 18px;
  }}

  .badges {{
    display: flex;
    align-items: center;
    gap: 10px;
  }}

  .badge {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    border-radius: 9999px;
    background: #ffffff;
    border: 1px solid rgba(26, 26, 26, 0.14);
    font-family: ui-monospace, "SF Mono", "DM Mono", monospace;
    font-size: 12px;
    font-weight: 600;
    color: #1a1a1a;
    box-shadow: 0 1px 3px rgba(26, 26, 26, 0.04);
  }}

  .badge-chain {{
    background: rgba(255, 140, 0, 0.08);
    border-color: rgba(255, 140, 0, 0.3);
    color: #c96500;
    font-weight: 700;
  }}

  /* Content Body */
  .body {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 40px;
    margin: auto 0;
  }}

  .left-col {{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 670px;
  }}

  .eyebrow {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: ui-monospace, "SF Mono", "DM Mono", monospace;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(26, 26, 26, 0.62);
  }}

  .eyebrow-line {{
    width: 22px;
    height: 1.5px;
    background: #FF8A00;
  }}

  .title {{
    font-family: 'GT Alpina Typewriter', Georgia, serif;
    font-size: 66px;
    line-height: 1.03;
    font-weight: 400;
    letter-spacing: -0.03em;
    color: #1a1a1a;
  }}

  .subhead {{
    font-family: 'GT Alpina Typewriter', Georgia, serif;
    font-size: 20px;
    line-height: 1.45;
    color: #3a3a3a;
  }}

  .spec-pills {{
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }}

  .pill {{
    padding: 5px 11px;
    border-radius: 6px;
    background: rgba(26, 26, 26, 0.04);
    border: 1px solid rgba(26, 26, 26, 0.1);
    font-family: ui-monospace, "SF Mono", "DM Mono", monospace;
    font-size: 11.5px;
    font-weight: 600;
    color: #1a1a1a;
  }}

  /* Right Card */
  .right-col {{
    flex-shrink: 0;
    width: 324px;
    padding: 24px 22px;
    background: #ffffff;
    border: 1px solid rgba(26, 26, 26, 0.15);
    border-radius: 12px;
    box-shadow: 0 16px 40px rgba(26, 26, 26, 0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
  }}

  .right-mark {{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }}

  .spec-strip {{
    width: 100%;
    padding-top: 14px;
    border-top: 1px solid rgba(26, 26, 26, 0.08);
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: ui-monospace, "SF Mono", "DM Mono", monospace;
    font-size: 11px;
    color: rgba(26, 26, 26, 0.65);
  }}

  .spec-strip strong {{
    color: #1a1a1a;
  }}

  /* Footer */
  .footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(26, 26, 26, 0.1);
    padding-top: 16px;
    font-family: ui-monospace, "SF Mono", "DM Mono", monospace;
    font-size: 11.5px;
    color: rgba(26, 26, 26, 0.6);
  }}

  .footer-brand {{
    color: #1a1a1a;
    font-weight: 600;
  }}
</style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="halftone-glow"></div>

  <div class="card-frame">
    <div class="corner-mark corner-tl">+</div>
    <div class="corner-mark corner-tr">+</div>
    <div class="corner-mark corner-bl">+</div>
    <div class="corner-mark corner-br">+</div>

    <!-- Header -->
    <div class="header">
      <div style="display:flex;align-items:center;gap:14px;">
        {veil_logo_svg}
      </div>

      <div class="badges">
        <div class="badge">
          {rh_svg}
          <span style="opacity:0.4;">|</span>
          <span>Mainnet</span>
        </div>
        <div class="badge badge-chain">
          <span>Chain ID 4663</span>
        </div>
      </div>
    </div>

    <!-- Main Body -->
    <div class="body">
      <div class="left-col">
        <div class="eyebrow">
          <span class="eyebrow-line"></span>
          <span>Zero-Knowledge Privacy Pools · Uniswap v4</span>
        </div>

        <h1 class="title">private execution</h1>

        <p class="subhead">
          Non-custodial cryptographic privacy layer with association set proofs on Robinhood Chain.
        </p>

        <div class="spec-pills">
          <span class="pill">0xbow v1.2.1</span>
          <span class="pill">Groth16 SNARK</span>
          <span class="pill">LeanIMT Depth 20</span>
          <span class="pill">Cancun EVM</span>
          <span class="pill">Fixed 0.001 Notes</span>
        </div>
      </div>

      <!-- Right Column: Official Halftone Symbol -->
      <div class="right-col">
        <div class="right-mark">
          {veil_mark_svg}
        </div>
        <div class="spec-strip">
          <div>Fixed Denomination: <strong>0.001 ETH &amp; VEIL</strong></div>
          <div>Hook Flag: <strong>CREATE2 0x20c4</strong></div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        <span class="footer-brand">veilpools.com</span>
        <span style="margin: 0 6px; opacity: 0.4;">·</span>
        <span>@veilpools</span>
      </div>
      <div>
        <span>Audited Cryptographic Primitives</span>
        <span style="margin: 0 6px; opacity: 0.4;">·</span>
        <span>Fully Non-Custodial</span>
      </div>
    </div>
  </div>
</body>
</html>
"""

    temp_html = "scripts/temp_og_banner.html"
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)

    print("Generated temp_og_banner.html successfully.")

    # Render via headless Chrome
    out_png = os.path.abspath("public/og-banner.png")
    chrome_cmd = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--disable-gpu",
        f"--screenshot={out_png}",
        "--window-size=1200,630",
        f"file:///{os.path.abspath(temp_html)}"
    ]

    print("Running Chrome screenshot command...")
    res = subprocess.run(chrome_cmd, capture_output=True, text=True)
    print("Chrome output:", res.stdout, res.stderr)

    if os.path.exists("public/og-banner.png"):
        img = Image.open("public/og-banner.png")
        print(f"Captured PNG size: {img.size}, mode: {img.mode}")
        if img.size != (1200, 630):
            img = img.crop((0, 0, 1200, 630))
            img.save("public/og-banner.png")
        
        # Also save og-banner.jpg
        img_rgb = img.convert("RGB")
        img_rgb.save("public/og-banner.jpg", quality=95)
        print("Saved public/og-banner.png and public/og-banner.jpg successfully!")

    # Cleanup temp html
    if os.path.exists(temp_html):
        os.remove(temp_html)

if __name__ == "__main__":
    build_banner()
