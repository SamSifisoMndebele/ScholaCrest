import os
import subprocess

def get_shield_emblem_svg(id_suffix=""):
    return f"""
  <defs>
    <!-- Premium Royal Gradients -->
    <linearGradient id="goldGrad{id_suffix}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3B33D" />
      <stop offset="50%" stop-color="#D4901E" />
      <stop offset="100%" stop-color="#B26F0D" />
    </linearGradient>
    <linearGradient id="goldHighlight{id_suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FAD06C" />
      <stop offset="100%" stop-color="#E19D26" />
    </linearGradient>
    <linearGradient id="navyFacetGrad{id_suffix}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1B4782" />
      <stop offset="100%" stop-color="#0E2850" />
    </linearGradient>
    <linearGradient id="darkNavyGrad{id_suffix}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E264E" />
      <stop offset="100%" stop-color="#07162C" />
    </linearGradient>

    <!-- Clip Path for Shield Interior -->
    <clipPath id="shieldInnerClip{id_suffix}">
      <path d="M 100 24 
               L 168 44 
               C 168 44, 168 110, 168 116 
               C 168 155, 100 193, 100 193 
               C 100 193, 32 155, 32 116 
               C 32 110, 32 44, 32 44 
               Z" />
    </clipPath>
  </defs>

  <!-- 1. Outer Dark Navy Contour -->
  <path d="M 100 10 
           L 182 32 
           C 182 32, 182 114, 182 122 
           C 182 168, 100 210, 100 210 
           C 100 210, 18 168, 18 122 
           C 18 114, 18 32, 18 32 
           Z" 
        fill="#0E2850" />

  <!-- 2. White Separation Inset -->
  <path d="M 100 18 
           L 174 38 
           C 174 38, 174 116, 174 122 
           C 174 163, 100 201, 100 201 
           C 100 201, 26 163, 26 122 
           C 26 116, 26 38, 26 38 
           Z" 
        fill="#FFFFFF" />

  <!-- 3. Primary Shield Frame -->
  <path d="M 100 24 
           L 168 44 
           C 168 44, 168 110, 168 116 
           C 168 155, 100 193, 100 193 
           C 100 193, 32 155, 32 116 
           C 32 110, 32 44, 32 44 
           Z" 
        fill="#0E2850" />

  <!-- 4. Shield Interior Artwork (Clipped) -->
  <g clip-path="url(#shieldInnerClip{id_suffix})">
    <!-- Pure White Base -->
    <rect x="0" y="0" width="200" height="240" fill="#FFFFFF" />

    <!-- Top Left Rim Facet -->
    <path d="M 100 24 L 32 44 L 40 58 L 100 36 Z" fill="url(#navyFacetGrad{id_suffix})" />

    <!-- Top Center-Right Midnight Navy Column (behind right book page) -->
    <path d="M 100 24 L 140 36 L 140 102 L 100 102 Z" fill="url(#darkNavyGrad{id_suffix})" />

    <!-- Lower Left Navy Field Under Book -->
    <path d="M 32 96 L 100 96 L 100 145 L 32 96 Z" fill="#143666" />
    <path d="M 32 96 L 100 145 L 100 193 C 100 193, 32 155, 32 116 Z" fill="#0E2850" />
    
    <!-- Diagonal Dynamic Accent in Lower Left -->
    <path d="M 32 110 L 100 156 L 100 193 C 100 193, 32 155, 32 116 Z" fill="#184077" />

    <!-- Bottom Center Bevel Split on Right Tip -->
    <path d="M 100 145 L 126 158 L 100 193 Z" fill="#0A1D38" />
  </g>

  <!-- 5. Classical Open Book of Wisdom -->
  <g id="openBookOfWisdom{id_suffix}">
    <!-- Layered Page Tabs on Far Left (Creates thickness/stepped pages) -->
    <path d="M 34 68 L 44 68 L 44 116 L 34 112 Z" fill="#9C5E0D" />
    <path d="M 40 64 L 52 64 L 52 118 L 40 114 Z" fill="#B87311" />

    <!-- Left Open Page (Angles upward from spine, flat outer edge, slanting bottom) -->
    <!-- Gold Border / Page Body -->
    <path d="M 100 68 
             L 50 56 
             L 50 116 
             L 100 128 
             Z" 
          fill="url(#goldGrad{id_suffix})" />
    <!-- White Page Leaf Face -->
    <path d="M 97 73 
             L 55 62 
             L 55 112 
             L 97 122 
             Z" 
          fill="#FFFFFF" />

    <!-- Right Open Page (Angles upward from spine, flat outer edge, slanting bottom) -->
    <!-- Gold Border / Page Body -->
    <path d="M 100 68 
             L 150 56 
             L 150 116 
             L 100 128 
             Z" 
          fill="url(#goldGrad{id_suffix})" />
    <!-- White Page Leaf Face -->
    <path d="M 103 73 
             L 145 62 
             L 145 112 
             L 103 122 
             Z" 
          fill="#FFFFFF" />

    <!-- Center Spine Spine Ribbon (Gold divider) -->
    <path d="M 98 66 L 102 66 L 102 134 L 98 134 Z" fill="url(#goldHighlight{id_suffix})" />

    <!-- Lower Book Base Arch (Curving gold foundation) -->
    <path d="M 50 116 
             C 74 126, 92 134, 100 134 
             C 108 134, 126 126, 150 116 
             L 144 123 
             C 124 131, 108 138, 100 138 
             C 92 138, 76 131, 56 123 
             Z" 
          fill="url(#goldGrad{id_suffix})" />
  </g>

  <!-- 6. Golden Botanical Laurel Branch on the Right -->
  <g id="botanicalLaurel{id_suffix}">
    <!-- Curved Central Stem -->
    <path d="M 100 148 
             C 114 146, 130 138, 142 122 
             C 152 108, 158 88, 154 60" 
          fill="none" 
          stroke="url(#goldGrad{id_suffix})" 
          stroke-width="3" 
          stroke-linecap="round" />

    <!-- Leaf Pair 1 (Bottom fronds pointing down-right) -->
    <path d="M 102 147 C 108 143, 118 147, 118 153 C 112 156, 105 152, 102 147 Z" fill="url(#goldGrad{id_suffix})" />
    <path d="M 110 149 C 117 143, 128 145, 128 154 C 120 156, 113 153, 110 149 Z" fill="url(#goldHighlight{id_suffix})" />

    <!-- Leaf Pair 2 -->
    <path d="M 112 136 C 120 128, 131 133, 131 141 C 122 143, 115 140, 112 136 Z" fill="url(#goldGrad{id_suffix})" />
    <path d="M 122 139 C 130 130, 142 134, 141 144 C 131 145, 124 142, 122 139 Z" fill="url(#goldHighlight{id_suffix})" />

    <!-- Leaf Pair 3 -->
    <path d="M 124 121 C 132 113, 144 117, 144 126 C 134 128, 127 125, 124 121 Z" fill="url(#goldGrad{id_suffix})" />
    <path d="M 134 123 C 143 114, 155 119, 153 129 C 143 130, 136 127, 134 123 Z" fill="url(#goldHighlight{id_suffix})" />

    <!-- Leaf Pair 4 -->
    <path d="M 134 104 C 143 95, 155 99, 154 109 C 144 111, 137 107, 134 104 Z" fill="url(#goldGrad{id_suffix})" />
    <path d="M 144 105 C 153 96, 164 100, 163 111 C 153 112, 146 109, 144 105 Z" fill="url(#goldHighlight{id_suffix})" />

    <!-- Leaf Pair 5 -->
    <path d="M 142 84 C 151 75, 162 78, 161 89 C 151 90, 145 87, 142 84 Z" fill="url(#goldGrad{id_suffix})" />
    <path d="M 151 84 C 159 75, 170 78, 168 90 C 158 90, 152 87, 151 84 Z" fill="url(#goldHighlight{id_suffix})" />

    <!-- Leaf Pair 6 (Upper) -->
    <path d="M 146 66 C 154 57, 165 61, 162 72 C 153 72, 148 69, 146 66 Z" fill="url(#goldGrad{id_suffix})" />
    <path d="M 153 64 C 160 55, 170 59, 167 71 C 158 71, 154 67, 153 64 Z" fill="url(#goldHighlight{id_suffix})" />

    <!-- Leaf 7 (Top Tip pointing upwards) -->
    <path d="M 144 48 C 151 38, 161 42, 158 53 C 150 54, 146 51, 144 48 Z" fill="url(#goldHighlight{id_suffix})" />
  </g>
"""

# 1. Pure Icon SVG (ViewBox tightly hugging the shield)
icon_only_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 4 180 212" width="100%" height="100%">
{get_shield_emblem_svg("Icon")}
</svg>"""

# 2. Icon Badge SVG (With soft rounded squircle background)
icon_badge_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <filter id="badgeShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0E2850" flood-opacity="0.12" />
    </filter>
  </defs>
  <rect x="12" y="12" width="232" height="232" rx="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#badgeShadow)" />
  <g transform="translate(28, 24) scale(0.98)">
{get_shield_emblem_svg("Badge")}
  </g>
</svg>"""

# 3. Horizontal Lockup SVG (Shield on Left, Text on Right)
horizontal_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 160" width="100%" height="100%">
  <g transform="translate(10, 5) scale(0.68)">
{get_shield_emblem_svg("Horiz")}
  </g>
  <text x="175" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="46" font-weight="900" fill="#0E2850" letter-spacing="2">SCHOLACREST</text>
  <text x="178" y="116" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="16" font-weight="700" fill="#183E75" letter-spacing="5">SCHOOL MANAGEMENT SYSTEM</text>
</svg>"""

# 4. Vertical / Stacked SVG (Shield Centered Above Text)
vertical_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <g transform="translate(100, 10) scale(0.95)">
{get_shield_emblem_svg("Vert")}
  </g>
  <text x="200" y="254" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="34" font-weight="900" fill="#0E2850" letter-spacing="2.5">SCHOLACREST</text>
  <text x="200" y="284" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="12.5" font-weight="700" fill="#183E75" letter-spacing="4.5">SCHOOL MANAGEMENT SYSTEM</text>
</svg>"""

# Write to public files
with open("public/scholacrest-icon.svg", "w", encoding="utf-8") as f:
    f.write(icon_only_svg)

with open("public/scholacrest-badge.svg", "w", encoding="utf-8") as f:
    f.write(icon_badge_svg)

with open("public/scholacrest-horizontal.svg", "w", encoding="utf-8") as f:
    f.write(horizontal_svg)

with open("public/scholacrest-vertical.svg", "w", encoding="utf-8") as f:
    f.write(vertical_svg)

with open("public/scholacrest-logo.svg", "w", encoding="utf-8") as f:
    f.write(horizontal_svg)

print("Updated SVGs written successfully.")
