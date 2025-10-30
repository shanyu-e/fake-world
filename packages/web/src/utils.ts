import SparkMD5 from "spark-md5";

import { ping } from "./services";

export const getFileMD5 = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hash = SparkMD5.ArrayBuffer.hash(arrayBuffer);
  return hash;
};

export const isMD5 = (str: string | undefined): boolean => {
  if (!str) {
    return false;
  }
  if (str.length !== 32) {
    return false;
  }

  const hexPattern = /^[a-f0-9]+$/i;

  return hexPattern.test(str);
};

export const animateElement = (elementSelector: string, animation: string) =>
  new Promise((resolve, reject) => {
    const animationName = `animate__${animation}`;
    const node = document.querySelector(elementSelector) as HTMLElement | null;

    function handleAnimationEnd(event: Event) {
      event.stopPropagation();

      node!.classList.remove("animate__animated", animationName);
      node!.removeEventListener("animationend", handleAnimationEnd);
      node!.dataset.animating = "false";
      resolve("Animation ended");
    }

    if (node) {
      if (node.dataset.animating === "true") {
        resolve("Element is currently animating");
      } else {
        node.classList.remove("animate__animated", animationName);
        node.classList.add("animate__animated", animationName);
        node.addEventListener("animationend", handleAnimationEnd, { once: true });
        node.dataset.animating = "true";
      }
    } else {
      reject("Element not found");
    }
  });

export const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loadedImages = new Set<string>();

export const preloadImages = (urls: string[]) => {
  urls.forEach((url) => {
    if (loadedImages.has(url)) return;

    const img = new Image();
    img.onload = () => loadedImages.add(url);
    img.src = url;
  });
};

export async function backendHealthCheck() {
  try {
    await ping();
  } catch (e) {
    /* empty */
  }
}

export const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${date.getHours()}:${date.getMinutes()}`;
  if (diffHour < 48) return "昨天";

  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  // 如果本年本月，显示星期几，否则显示完整日期
  if (now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth()) {
    return weekdays[date.getDay()];
  }
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};
