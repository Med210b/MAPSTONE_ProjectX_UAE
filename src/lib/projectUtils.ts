/**
 * Utility functions for project image and folder mapping
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')         // Remove all non-word chars
    .replace(/--+/g, '-')            // Replace multiple - with single -
    .replace(/^-+/, '')              // Trim - from start of text
    .replace(/-+$/, '');             // Trim - from end of text
}

export function getProjectFolderPath(projectName: string): string {
  return `/images/projects/${projectName}`;
}

export function getProjectImageUrl(projectName: string): string {
  return `/images/projects/${projectName}/main.png`;
}

export function getProjectGalleryUrls(projectName: string, mainImageUrl?: string, count: number = 8): string[] {
  const localUrls = Array.from({ length: count }, (_, i) => `/images/projects/${projectName}/${i + 1}.png`);
  
  if (mainImageUrl && mainImageUrl.startsWith('http') && mainImageUrl.includes('main.png')) {
    const baseUrl = mainImageUrl.replace('main.png', '');
    const remoteUrls = Array.from({ length: count }, (_, i) => `${baseUrl}${i + 1}.png`);
    return [...remoteUrls, ...localUrls];
  }
  
  return localUrls;
}
