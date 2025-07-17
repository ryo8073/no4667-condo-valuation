# Genesis Development Framework v2.0 - Rules

Welcome to the Genesis Development Framework (GDF) v2.0. This directory contains the complete set of 14 prompt rules designed to transform your AI-assisted development workflow.

## 1. What is GDF?

GDF is a comprehensive system of prompts that structures your interaction with AI assistants. It's built on a hybrid philosophy:

-   **Socratic Dialogue:** To explore the "why" behind your project, ensuring you're building the right thing.
-   **Adaptive Intelligence:** To execute the "what" and "how" with speed, precision, and context-awareness.

The framework is organized into a 3-layer architecture to provide the right level of assistance at any point in the development lifecycle.

-   **L1 Master Prompts:** High-level personas that guide you through major development phases (Vision, Architecture, Deployment, etc.).
-   **L2 Task Prompts:** Specialists designed to execute specific, complex tasks (API Design, Testing, Refactoring, etc.).
-   **L3 Micro Prompts:** Micro-tools for fine-grained, in-editor actions (Optimizing code, improving names).

## 2. How to Use with Cursor (or similar editors)

These files are designed to be used as a "ruleset" in AI-native code editors like Cursor.

### Setup

1.  **Place the Folder:** Unzip the downloaded file and place this entire `Genesis_Development_Framework_v2.0` directory in a location you can easily access.
2.  **Configure your Editor:** In your AI editor (e.g., Cursor), find the settings for AI rules, custom prompts, or `@-mentions`. This is often in the AI settings panel or configuration files.
3.  **Add the Directory:** Add the path to the `Genesis_Development_Framework_v2.0` directory to your editor's rules configuration. The editor will scan this directory and make the prompts available via `@` commands.

### Invoking Prompts

Once configured, you can invoke any of the 14 GDF prompts directly in your chat or code editor.

**Syntax:** `@<prompt_name>`

#### Examples:

-   **Starting a new project:**
    Open the AI chat and start with `@Vision` to define the project's core purpose.
    `@Vision`

-   **Designing a system:**
    After defining the vision, use `@Architect` to create the technical blueprint.
    `@Architect`

-   **Generating test code for a function:**
    Highlight a function in your code, open the chat/command palette, and use:
    `@Co-Builder @task:test`

-   **Refactoring a complex piece of code:**
    Highlight the code you want to improve and ask `@Quality` and `@task:refactor` to help.
    `@Quality @task:refactor`

-   **Improving a variable name:**
    Highlight a variable like `let data;` and use the `@micro:naming` prompt for better suggestions.
    `@micro:naming`

By combining prompts, you can create highly specialized AI assistants tailored to your immediate needs, leveraging the full power of the Genesis Development Framework.
