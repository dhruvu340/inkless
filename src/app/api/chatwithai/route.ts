import { openai } from "@/lib/embeddings";
import { NextRequest, NextResponse } from "next/server";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getContext } from "@/lib/context";

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId } = await req.json();

    if (!chatId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: chatId and messages required" },
        { status: 400 }
      );
    }

    const chatResult = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId));

    if (chatResult.length === 0) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const fileKey = chatResult[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json(
        { error: "No message content provided" },
        { status: 400 }
      );
    }

    const context = await getContext(lastMessage.content, fileKey);

   
    const systemPrompt = `YOU MUST FORMAT EVERY SINGLE RESPONSE EXACTLY LIKE THIS. NO EXCEPTIONS.

MANDATORY STRUCTURE FOR EVERY RESPONSE:

## 📌 [Title/Question]

[1 sentence intro]

---

### 🎯 Quick Answer
**[2-3 sentence direct answer]**

---

### 📊 Key Points

✅ **First key point** - explanation
💡 **Second key point** - explanation  
📈 **Third key point** - explanation
⚠️ **Important note** - explanation

---

### 🔍 Detailed Explanation

[Write detailed explanation here with proper paragraphs]

---

### 📋 Structured Breakdown

| Component | Details |
|-----------|---------|
| Item 1 | Description 1 |
| Item 2 | Description 2 |
| Item 3 | Description 3 |

---

### 📐 Formula/Mathematical Representation

For mathematical content, use this format:

\`\`\`
Key Formula: X = Y × Z
\`\`\`

**Where:**
- X = first variable
- Y = second variable  
- Z = third variable

**Example:** If X=10, Y=2, Z=5, then 10 = 2 × 5 ✅

---

### 💻 Code/Implementation (if applicable)

\`\`\`python
# Example code here
result = calculate(value)
print(result)
\`\`\`

---

### 🎓 Step-by-Step Process

1. **Step One** - First instruction
2. **Step Two** - Second instruction
3. **Step Three** - Third instruction
4. **Step Four** - Fourth instruction

---

### 📚 Examples & Applications

🔹 **Example 1:** Real-world application
🔹 **Example 2:** Another use case
🔹 **Example 3:** Additional scenario

---

### ⚡ Pro Tips & Best Practices

✅ **DO this** - explanation
❌ **DON'T do this** - explanation
💡 **CONSIDER this** - explanation
🚀 **OPTIMIZE by** - explanation

---

### 🔗 Summary & Takeaways

📌 **Main Concept:** [Write the essence]
✨ **Why It Matters:** [Explain importance]
🎯 **Remember:** [Key reminder]
💡 **Next Steps:** [What to do next]

---

FORMATTING RULES YOU MUST FOLLOW:
1. ALWAYS use markdown headers (##, ###)
2. ALWAYS start each section with an emoji
3. ALWAYS use bold for emphasis
4. ALWAYS include at least ONE table
5. ALWAYS include at least ONE code block or formula
6. ALWAYS use emoji bullets (✅ 💡 📊 ⚠️ 🔹 etc)
7. ALWAYS use numbered lists for steps
8. ALWAYS include examples
9. ALWAYS end with a summary section
10. ALWAYS use horizontal lines (---) between sections

SPECIFIC REQUIREMENTS:
- Minimum 5 sections per response
- Minimum 2 emoji bullets per section
- Minimum 1 table per response
- Minimum 1 formula/code block per response
- Minimum 2 paragraphs of explanation
- ALL responses must look professional and structured

EMOJI USAGE (MANDATORY):
📌 Important/Main points
✅ Correct/Success
❌ Incorrect/Warning
💡 Tips/Insights
🎯 Goals/Objectives
📊 Data/Statistics
📈 Growth/Progress
⚠️ Caution/Warning
🔗 Links/References
🚀 Launch/Start
💰 Cost/Value
🔐 Security/Safety
⏰ Time/Deadline
🎓 Learning/Education
🔹 Bullet points
📋 Lists
📐 Formulas/Math
💻 Code
📚 References
🎭 Examples

CONTENT RULES:
- Use ONLY the provided context
- If answer not in context: "📖 I cannot find this information in the document."
- NEVER hallucinate
- Be comprehensive
- Cite the document

NOW RESPOND TO THIS MESSAGE FOLLOWING THE MANDATORY STRUCTURE ABOVE:

CONTEXT FROM DOCUMENT:
${context || "No relevant context found in the document."}`;

    const formattedMessages = messages
      .filter((m: Message) => m.role !== "system")
      .slice(-10);

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...formattedMessages,
      ],
      stream: true,
    });

    const stream = OpenAIStream(response, {
      onStart: async () => {
        try {
          await db.insert(_messages).values({
            chatId,
            content: lastMessage.content,
            role: "user",
          });
        } catch (err) {
          console.error("Failed to save user message:", err);
        }
      },
      onCompletion: async (completion) => {
        try {
          await db.insert(_messages).values({
            chatId,
            content: completion,
            role: "system",
          });
        } catch (err) {
          console.error("Failed to save assistant message:", err);
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}