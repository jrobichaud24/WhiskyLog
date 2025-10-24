import highlandImage from "@assets/highlands_1755825461469.webp";
import speysideImage from "@assets/speyside_1755825514874.webp";
import islayImage from "@assets/islay_1755825546575.webp";
import lowlandImage from "@assets/lowlands_1755825572942.webp";
import islandImage from "@assets/islands_1755825588916.webp";
import campbeltownImage from "@assets/campbeltown_1755825615246.webp";

export interface RegionGalleryItem {
  region: string;
  displayName: string;
  image: string;
  alt: string;
  caption?: string;
}

export const regionGalleryData: RegionGalleryItem[] = [
  {
    region: "Highland",
    displayName: "Highland Region",
    image: highlandImage,
    alt: "Highland Region landscape with rolling hills and misty mountains",
    caption: "The largest whisky region with diverse flavor profiles"
  },
  {
    region: "Speyside",
    displayName: "Speyside",
    image: speysideImage,
    alt: "Speyside Region castle and landscape with River Spey",
    caption: "Home to over half of Scotland's distilleries"
  },
  {
    region: "Islay",
    displayName: "Islay",
    image: islayImage,
    alt: "Islay coastal cliffs and ocean with dramatic waves",
    caption: "Famous for peaty, smoky single malts"
  },
  {
    region: "Lowland",
    displayName: "Lowland",
    image: lowlandImage,
    alt: "Lowland rolling hills and river valley",
    caption: "Known for lighter, gentler whiskies"
  },
  {
    region: "Island",
    displayName: "Island",
    image: islandImage,
    alt: "Island mountains and coastal waters with rugged terrain",
    caption: "Diverse maritime character from island distilleries"
  },
  {
    region: "Campbeltown",
    displayName: "Campbeltown",
    image: campbeltownImage,
    alt: "Campbeltown lighthouse and coastal cliffs",
    caption: "Once the whisky capital of the world"
  }
];
