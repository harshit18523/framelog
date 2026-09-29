export const manifest = {
  screens: {
    scr_8q3s1c: { name: "Landing", route: "/", position: { "x": 160, "y": 220 } },
    scr_jkl1js: { name: "Sign in", route: "/login", position: { "x": 1560, "y": 220 } },
    scr_zvr93h: { name: "Create account", route: "/register", position: { "x": 2960, "y": 220 } },
    scr_f3jk8m: { name: "Home feed", route: "/app", state: { "feedFilter": "all" }, position: { "x": 160, "y": 2200 } },
    scr_l07u4d: { name: "Home – Reviews", route: "/app", state: { "feedFilter": "reviews" }, position: { "x": 1560, "y": 2200 } },
    scr_xvmr7z: { name: "Log film – Search", route: "/app", state: { "logOpen": true }, position: { "x": 160, "y": 4180 } },
    scr_g71tze: { name: "Log film – Details", route: "/app", state: { "logOpen": true, "logFilmId": "the-quiet-hours" }, position: { "x": 1560, "y": 4180 } },
    scr_xrmwft: { name: "Film – The Quiet Hours", route: "/app/film/the-quiet-hours", position: { "x": 160, "y": 6160 } },
    scr_kdsknx: { name: "Film – The Long Field", route: "/app/film/the-long-field", position: { "x": 1560, "y": 6160 } },
    scr_01qdbt: { name: "Film – No reviews", route: "/app/film/low-orbit", position: { "x": 2960, "y": 6160 } },
    scr_1ansra: { name: "Profile – Films", route: "/app/profile", state: { "profileTab": "films" }, position: { "x": 160, "y": 8140 } },
    scr_se9cw1: { name: "Profile – Diary", route: "/app/profile", state: { "profileTab": "diary" }, position: { "x": 1560, "y": 8140 } },
    scr_xwxfu1: { name: "Profile – Reviews", route: "/app/profile", state: { "profileTab": "reviews" }, position: { "x": 2960, "y": 8140 } },
    scr_2qrbil: { name: "Profile – Lists", route: "/app/profile", state: { "profileTab": "lists" }, position: { "x": 4360, "y": 8140 } },
    scr_ejramj: { name: "Profile – Watchlist", route: "/app/profile", state: { "profileTab": "watchlist" }, position: { "x": 5760, "y": 8140 } },
    scr_zy9qcb: { name: "Diary – Timeline", route: "/app/diary", state: { "diaryView": "timeline" }, position: { "x": 160, "y": 10120 } },
    scr_bt3nwo: { name: "Diary – Calendar", route: "/app/diary", state: { "diaryView": "calendar" }, position: { "x": 1560, "y": 10120 } },
    scr_v2b9t3: { name: "Discover", route: "/app/discover", position: { "x": 160, "y": 12100 } }
  },
  sections: {
    sec_ut1xd4: { name: "Onboarding", x: 0, y: 0, width: 4320, height: 1180 },
    sec_hsiomd: { name: "Home feed", x: 0, y: 1980, width: 2920, height: 1180 },
    sec_8ly8j0: { name: "Log film", x: 0, y: 3960, width: 2920, height: 1180 },
    sec_08mvmq: { name: "Film details", x: 0, y: 5940, width: 4320, height: 1180 },
    sec_ss1pin: { name: "Profile", x: 0, y: 7920, width: 7120, height: 1180 },
    sec_1g14th: { name: "Diary", x: 0, y: 9900, width: 2920, height: 1180 },
    sec_km49oz: { name: "Discover", x: 0, y: 11880, width: 1520, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_ut1xd4", children: [
    { kind: "screen", id: "scr_8q3s1c" },
    { kind: "screen", id: "scr_jkl1js" },
    { kind: "screen", id: "scr_zvr93h" }]
  },
  { kind: "section", id: "sec_hsiomd", children: [
    { kind: "screen", id: "scr_f3jk8m" },
    { kind: "screen", id: "scr_l07u4d" }]
  },
  { kind: "section", id: "sec_8ly8j0", children: [
    { kind: "screen", id: "scr_xvmr7z" },
    { kind: "screen", id: "scr_g71tze" }]
  },
  { kind: "section", id: "sec_08mvmq", children: [
    { kind: "screen", id: "scr_xrmwft" },
    { kind: "screen", id: "scr_kdsknx" },
    { kind: "screen", id: "scr_01qdbt" }]
  },
  { kind: "section", id: "sec_ss1pin", children: [
    { kind: "screen", id: "scr_1ansra" },
    { kind: "screen", id: "scr_se9cw1" },
    { kind: "screen", id: "scr_xwxfu1" },
    { kind: "screen", id: "scr_2qrbil" },
    { kind: "screen", id: "scr_ejramj" }]
  },
  { kind: "section", id: "sec_1g14th", children: [
    { kind: "screen", id: "scr_zy9qcb" },
    { kind: "screen", id: "scr_bt3nwo" }]
  },
  { kind: "section", id: "sec_km49oz", children: [
    { kind: "screen", id: "scr_v2b9t3" }]
  }]

};