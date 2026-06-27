import sys

def build_blog(filename, title, content_paragraphs):
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    nav_end = 0
    footer_start = 0
    for i, line in enumerate(lines):
        if '</nav>' in line:
            nav_end = i
        if '<footer' in line:
            footer_start = i
            break
            
    head = lines[:nav_end+1]
    tail = lines[footer_start:]
    
    html = ['<div class="section" style="padding-top: 150px; min-height: 80vh;">\n',
            '  <div class="wrap" style="max-width: 800px; margin: 0 auto; text-align: left;">\n',
            f'    <h1 style="font-size: 48px; margin-bottom: 40px; color: var(--text);">{title}</h1>\n']
    
    for p in content_paragraphs:
        if p.startswith('<h2>'):
            html.append(f'    <h2 style="font-size: 32px; margin-top: 50px; margin-bottom: 20px; color: var(--text);">{p[4:-5]}</h2>\n')
        else:
            html.append(f'    <p style="font-size: 20px; line-height: 1.8; margin-bottom: 24px; color: var(--text-muted);">{p}</p>\n')
            
    html.append('  </div>\n</div>\n')
    
    with open(filename, 'w') as f:
        f.writelines(head + html + tail)

# Blog 1
b1_title = "What is Agentic AI and Why Your Business Needs It"
b1_p = [
    "Imagine your absolute best employee. The one who never sleeps. The one who never complains. The one who somehow always closes the deal.",
    "Now imagine cloning them a thousand times over.",
    "In the rapidly evolving landscape of artificial intelligence, a new term is taking center stage: Agentic AI. While traditional AI chatbots and basic automation tools have been around for years, Agentic AI represents a fundamental shift in how software interacts with the physical world. It is about to transform your entire business.",
    "<h2>From Chatbots to Agents: The Fundamental Shift</h2>",
    "To understand Agentic AI, we first need to look at what it is not. Generative AI like ChatGPT is excellent at creating text or writing code based on prompts. It is essentially a high powered calculator for language. Standard automation follows rigid rules. It is reliable but incredibly fragile when faced with complex human variability.",
    "Agentic AI goes a massive step further. It does not just talk. It acts. An AI agent has true agency. It possesses the ability to reason, use complex tools, interact with other digital systems, and make high level decisions to achieve a specific goal.",
    "<h2>How Amira HSR Solves the Problem</h2>",
    "At Amira Human Software Resources, we build agentic systems that speak perfectly in your brand's voice and act with your exact expertise. Instead of a lead sitting in an inbox for hours, an Amira agent can reach out via Voice, WhatsApp, or Email within seconds. It qualifies the lead, answers incredibly complex questions, and books a meeting directly into your CRM.",
    "Every business has hidden work. It is the repetitive, high friction tasks that eat up your team's valuable time. AMIRA makes it move.",
    "By deploying Agentic AI, you are not just automating. You are delegating. You are freeing your human experts to focus on what they do best: building authentic relationships and solving the truly complex problems that require a human touch."
]

build_blog('blog-agentic-ai.html', b1_title, b1_p)

# Blog 2
b2_title = "Closing the Service Gap: Stop Bleeding Leads While You Sleep"
b2_p = [
    "You are losing money while you sleep.",
    "Every single night, potential clients are filling out forms on your website, asking questions, and waiting for an answer. By the time your team clocks in the next morning, that lead has already moved on to a competitor who responded faster.",
    "Most modern businesses suffer from what we call the Service Gap. This is the massive, silent void between a customer expressing interest and a human employee actually being able to respond.",
    "<h2>The brutal reality of response times</h2>",
    "According to major industry studies, companies that try to contact potential customers within an hour of receiving a query are nearly seven times as likely to have a meaningful conversation with a key decision maker. If you wait 24 hours, the lead is completely dead.",
    "The problem is painfully obvious. Humans cannot be everywhere at once. We need sleep. We take vacations. We get overwhelmed. Agentic AI does not.",
    "<h2>Enter the Digital Concierge</h2>",
    "At Amira Human Software Resources, we obliterate the Service Gap. We deploy autonomous digital concierges that operate across all platforms in over 120 languages. Whether your clients prefer voice calls, SMS messages, or Telegram, our agents are there.",
    "They do not just offer a generic greeting. Our agents connect deep into your internal databases. They provide real time answers, perform critical actions like checking order statuses, and update KYC documents on the fly.",
    "Stop bleeding leads. Stop letting your response time dictate your revenue. Close the Service Gap today and let Amira handle the heavy lifting."
]

build_blog('blog-service-gap.html', b2_title, b2_p)

# Update index.html with WhatsApp and Blog links
with open('index.html', 'r') as f:
    idx = f.read()

wa_btn = '''
<style>.wa-float{position:fixed;left:22px;bottom:22px;z-index:1000;display:inline-flex;align-items:center;gap:9px;padding:11px 20px;background:#fdfbf7;color:#2c2420;border:1px solid #b8956a;border-radius:100px;text-decoration:none;font-family:'Outfit','Nunito Sans',system-ui,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;box-shadow:0 6px 22px rgba(44,36,32,.12);transition:all .25s ease}.wa-float svg{transition:fill .25s ease}.wa-float:hover{background:#b8956a;color:#fdfbf7;box-shadow:0 8px 26px rgba(184,149,106,.3)}.wa-float:hover svg path{fill:#fdfbf7}@media(max-width:520px){.wa-float{left:16px;bottom:16px;padding:10px 16px}}</style>
<a href="https://wa.me/972506484887?text=Hi%20Amira%20team,%20I'd%20like%20to%20learn%20more!" class="wa-float" aria-label="Message us on WhatsApp">
  <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#2c2420" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  WhatsApp
</a>
</body>
'''
if 'wa-float' not in idx:
    idx = idx.replace('</body>', wa_btn)

nav_links = '''<div class="nav-links">
      <a href="blog-agentic-ai.html" class="nav-link">Blog</a>'''
if 'blog-agentic-ai.html' not in idx:
    idx = idx.replace('<div class="nav-links">', nav_links)

with open('index.html', 'w') as f:
    f.write(idx)

for city in ['london.html', 'zurich.html', 'california.html', 'brooklyn.html', 'johannesburg.html']:
    with open(city, 'r') as f:
        c = f.read()
    if 'wa-float' not in c:
        c = c.replace('</body>', wa_btn)
    if 'blog-agentic-ai.html' not in c:
        c = c.replace('<div class="nav-links">', nav_links)
    with open(city, 'w') as f:
        f.write(c)

print("Blogs built and WhatsApp button injected successfully.")
