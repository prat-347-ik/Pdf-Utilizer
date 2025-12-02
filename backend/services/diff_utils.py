import sys
import fitz  # PyMuPDF
import difflib

# --- CONFIGURATION ---
COLOR_DELETE_LINE = (1, 0.8, 0.8)    # Light Red (Background for deleted lines)
COLOR_INSERT_LINE = (0.8, 1, 0.8)    # Light Green (Background for added lines)
COLOR_MODIFIED_LINE = (1, 1, 0.8)    # Light Yellow (Background for modified lines)

COLOR_DELETE_WORD = (1, 0.4, 0.4)    # Dark Red (Specific deleted words)
COLOR_INSERT_WORD = (0.4, 1, 0.4)    # Dark Green (Specific added words)
COLOR_REPLACE_WORD = (1, 0.8, 0)     # Orange/Gold (Specific changed words)

def get_lines_with_details(page):
    """
    Extracts lines but preserves individual word coordinates.
    Returns: [ { 'text': str, 'rect': Rect, 'words': [ {text, rect}, ... ] }, ... ]
    """
    words = page.get_text("words") 
    lines = []
    
    if not words:
        return lines

    current_line_idx = -1
    current_block_idx = -1
    line_buffer = {'text': [], 'rects': [], 'word_objects': []}

    for w in words:
        x0, y0, x1, y1, text, block, line, word_idx = w
        word_rect = fitz.Rect(x0, y0, x1, y1)

        # Check if we are starting a new line
        if block != current_block_idx or line != current_line_idx:
            # Save previous line
            if line_buffer['text']:
                full_text = " ".join(line_buffer['text'])
                # Union of all word rects creates the line rect
                full_rect = line_buffer['rects'][0]
                for r in line_buffer['rects'][1:]:
                    full_rect = full_rect | r
                
                lines.append({
                    'text': full_text,
                    'rect': full_rect,
                    'words': line_buffer['word_objects']
                })
            
            # Reset
            current_block_idx = block
            current_line_idx = line
            line_buffer = {'text': [text], 'rects': [word_rect], 'word_objects': [{'text': text, 'rect': word_rect}]}
        else:
            # Append to current
            line_buffer['text'].append(text)
            line_buffer['rects'].append(word_rect)
            line_buffer['word_objects'].append({'text': text, 'rect': word_rect})

    # Flush last line
    if line_buffer['text']:
        full_text = " ".join(line_buffer['text'])
        full_rect = line_buffer['rects'][0]
        for r in line_buffer['rects'][1:]:
            full_rect = full_rect | r
        lines.append({
            'text': full_text,
            'rect': full_rect,
            'words': line_buffer['word_objects']
        })

    return lines

def highlight_word_changes(page_old, page_new, old_line_obj, new_line_obj):
    """
    Performs word-by-word diff on two similar lines and highlights discrepancies.
    """
    old_words = [w['text'] for w in old_line_obj['words']]
    new_words = [w['text'] for w in new_line_obj['words']]
    
    matcher = difflib.SequenceMatcher(None, old_words, new_words)
    
    for opcode, a0, a1, b0, b1 in matcher.get_opcodes():
        if opcode == 'delete':
            # Highlight deleted words on OLD page
            for i in range(a0, a1):
                annot = page_old.add_highlight_annot(old_line_obj['words'][i]['rect'])
                annot.set_colors(stroke=COLOR_DELETE_WORD)
                annot.update()
                
        elif opcode == 'insert':
            # Highlight inserted words on NEW page
            for i in range(b0, b1):
                annot = page_new.add_highlight_annot(new_line_obj['words'][i]['rect'])
                annot.set_colors(stroke=COLOR_INSERT_WORD)
                annot.update()
                
        elif opcode == 'replace':
            # Highlight changed words on BOTH pages
            for i in range(a0, a1):
                annot = page_old.add_highlight_annot(old_line_obj['words'][i]['rect'])
                annot.set_colors(stroke=COLOR_REPLACE_WORD)
                annot.update()
            for i in range(b0, b1):
                annot = page_new.add_highlight_annot(new_line_obj['words'][i]['rect'])
                annot.set_colors(stroke=COLOR_REPLACE_WORD)
                annot.update()

def create_diff_pdf_stream(old_path, new_path):
    print(f"Diffing (Granular): {old_path} vs {new_path}", file=sys.stderr)

    doc_old = fitz.open(old_path)
    doc_new = fitz.open(new_path)
    doc_out = fitz.open()

    max_pages = max(len(doc_old), len(doc_new))

    for i in range(max_pages):
        # Extract Lines with deep structure
        lines_old = []
        page_old = None
        if i < len(doc_old):
            page_old = doc_old[i]
            lines_old = get_lines_with_details(page_old)

        lines_new = []
        page_new = None
        if i < len(doc_new):
            page_new = doc_new[i]
            lines_new = get_lines_with_details(page_new)

        # Diff based on full line text
        text_old = [x['text'] for x in lines_old]
        text_new = [x['text'] for x in lines_new]

        matcher = difflib.SequenceMatcher(None, text_old, text_new, autojunk=False)

        for opcode, a0, a1, b0, b1 in matcher.get_opcodes():
            
            # --- PURE DELETE ---
            if opcode == 'delete':
                if page_old:
                    for idx in range(a0, a1):
                        annot = page_old.add_highlight_annot(lines_old[idx]['rect'])
                        annot.set_colors(stroke=COLOR_DELETE_LINE)
                        annot.update()

            # --- PURE INSERT ---
            elif opcode == 'insert':
                if page_new:
                    for idx in range(b0, b1):
                        annot = page_new.add_highlight_annot(lines_new[idx]['rect'])
                        annot.set_colors(stroke=COLOR_INSERT_LINE)
                        annot.update()

            # --- MODIFICATION ---
            elif opcode == 'replace':
                # Check Similarity to decide: "Is this a new sentence or just a typo?"
                block_old = " ".join(text_old[a0:a1])
                block_new = " ".join(text_new[b0:b1])
                similarity = difflib.SequenceMatcher(None, block_old, block_new).ratio()

                if similarity < 0.6: 
                    # LOW SIMILARITY -> Treat as Delete + Insert (Red/Green)
                    if page_old:
                        for idx in range(a0, a1):
                            annot = page_old.add_highlight_annot(lines_old[idx]['rect'])
                            annot.set_colors(stroke=COLOR_DELETE_LINE)
                            annot.update()
                    if page_new:
                        for idx in range(b0, b1):
                            annot = page_new.add_highlight_annot(lines_new[idx]['rect'])
                            annot.set_colors(stroke=COLOR_INSERT_LINE)
                            annot.update()
                else:
                    # HIGH SIMILARITY -> Treat as Modification (Yellow) + Word Diff
                    # 1. Base Highlight (Light Yellow)
                    if page_old:
                        for idx in range(a0, a1):
                            annot = page_old.add_highlight_annot(lines_old[idx]['rect'])
                            annot.set_colors(stroke=COLOR_MODIFIED_LINE)
                            annot.update()
                    if page_new:
                        for idx in range(b0, b1):
                            annot = page_new.add_highlight_annot(lines_new[idx]['rect'])
                            annot.set_colors(stroke=COLOR_MODIFIED_LINE)
                            annot.update()
                    
                    # 2. Granular Highlight (Specific Words)
                    # Iterate through the lines in this block (usually 1-to-1, but can be n-to-m)
                    # We try to match them line-by-line for visual clarity
                    count = min(a1-a0, b1-b0)
                    for offset in range(count):
                        if page_old and page_new:
                             highlight_word_changes(
                                 page_old, 
                                 page_new, 
                                 lines_old[a0 + offset], 
                                 lines_new[b0 + offset]
                             )

        if page_old:
            doc_out.insert_pdf(doc_old, from_page=i, to_page=i)
        if page_new:
            doc_out.insert_pdf(doc_new, from_page=i, to_page=i)

    sys.stdout.buffer.write(doc_out.tobytes())
    doc_old.close()
    doc_new.close()
    doc_out.close()

if __name__ == "__main__":
    if len(sys.argv) > 2:
        try:
            create_diff_pdf_stream(sys.argv[1], sys.argv[2])
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)