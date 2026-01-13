#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

# Read the file
with open('sportsMeetSlice.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all garbled Chinese comments and error messages with English
replacements = [
    # Comments with export on same line
    (r'//\s*寮傛[^\n]*export\s+const', '// Async thunk\nexport const'),
    (r'//\s*鎶ュ悕[^\n]*', '// Registration management'),
    (r'//\s*鍦洪[^\n]*', '// Venue management'),  
    (r'//\s*瑁佸垽[^\n]*', '// Referee management'),
    (r'//\s*鎴愮哗[^\n]*', '// Score management'),
    (r'//\s*璧涚▼[^\n]*', '// Schedule management'),
    
    # Error messages - all Chinese text in quotes
    (r"'[鑾峰彇鍒涘缓鏇存柊鍒犻櫎瀹℃牳鎵归噺瀵煎叆瀵煎嚭涓嬭浇鏌ヨ][^']{0,50}澶辫触'", "'Operation failed'"),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Write back
with open('sportsMeetSlice.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed encoding issues in sportsMeetSlice.js")
