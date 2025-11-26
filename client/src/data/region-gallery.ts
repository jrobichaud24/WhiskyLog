import highlandImage from "@assets/highlands_1755825461469.webp";
import speysideImage from "@assets/speyside_1755825514874.webp";
import islayImage from "@assets/islay_1755825546575.webp";
import lowlandImage from "@assets/lowlands_1755825572942.webp";
import islandImage from "@assets/islands_1755825588916.webp";
import campbeltownImage from "@assets/campbeltown_1755825615246.webp";

export type ScottishRegion = "Highlands" | "Speyside" | "Islay" | "Lowlands" | "Island" | "Campbeltown";

export interface RegionGalleryItem {
  region: ScottishRegion;
  displayName: string;
  image: string;
  alt: string;
}

export const regionGalleryData: RegionGalleryItem[] = [
  {
    region: "Highlands",
    displayName: "Highlands",
    image: highlandImage,
    alt: "Highland Region landscape with rolling hills and misty mountains"
  },
  {
    region: "Speyside",
    displayName: "Speyside",
    image: speysideImage,
    alt: "Speyside Region castle and landscape with River Spey"
  },
  {
    region: "Islay",
    displayName: "Islay",
    image: islayImage,
    alt: "Islay coastal cliffs and ocean with dramatic waves"
  },
  {
    region: "Lowlands",
    displayName: "Lowlands",
    image: lowlandImage,
    alt: "Lowland rolling hills and river valley"
  },
  {
    region: "Island",
    displayName: "Island",
    image: islandImage,
    alt: "Island mountains and coastal waters with rugged terrain"
  },
  {
    region: "Campbeltown",
    displayName: "Campbeltown",
    image: campbeltownImage,
    alt: "Campbeltown lighthouse and coastal cliffs"
  }
] as const;
