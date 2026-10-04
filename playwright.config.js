import {defineConfig} from '@playwright/test';
import {existsSync} from 'node:fs';
export default defineConfig({testDir:'./tests',fullyParallel:true,use:{baseURL:'http://127.0.0.1:5173/tinh-hoa-video-maker/',launchOptions:existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{},viewport:{width:1366,height:768}},webServer:{command:process.env.TEST_PRODUCTION ? 'npm run preview -- --host 127.0.0.1 --port 5173 --strictPort' : 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',url:'http://127.0.0.1:5173/tinh-hoa-video-maker/',reuseExistingServer:false},reporter:'list'});
