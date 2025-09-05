const templateCache = new Map<string, string>();

function isStorybookEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.location.pathname.includes("iframe.html") ||
      window.parent !== window ||
      document.querySelector("[data-storybook]") !== null)
  );
}

function resolveTemplatePath(templatePath: string): string[] {
  const isStorybook = isStorybookEnvironment();

  if (isStorybook) {
    // In Storybook, try these paths in order
    return [
      templatePath.replace("/src/", "/"), // Remove /src/ prefix
      templatePath, // Original path
      `.${templatePath}`, // Add relative prefix
    ];
  } else {
    // In main app, use original path structure
    return [templatePath];
  }
}

export async function loadTemplate(templatePath: string): Promise<string> {
  if (templateCache.has(templatePath)) {
    return templateCache.get(templatePath)!;
  }

  const pathsToTry = resolveTemplatePath(templatePath);

  for (const path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const template = await response.text();
        templateCache.set(templatePath, template);
        return template;
      }
    } catch (error) {
      // Continue to next path
      continue;
    }
  }

  console.error(`Failed to load template from any of these paths:`, pathsToTry);
  return "<div>Template loading error</div>";
}

export function clearTemplateCache(): void {
  templateCache.clear();
}
