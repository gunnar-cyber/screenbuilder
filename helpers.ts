import CrowdinAPI from "../crowdin-api";

// Build all devices concurrently and log results
export async function executeTranslationsConcurrently(generateConfigPaths: any[]) {
  const totalDevices = generateConfigPaths.length;
  
  console.log(`🚀 Starting concurrent translation process for ${totalDevices} device(s)...`);
  console.log("=".repeat(60));
  
  // Show what devices will be processed
  generateConfigPaths.forEach((device, index) => {
    console.log(`📱 Device ${index + 1}: ${device.id} (${device.FILE_NAME})`);
  });
  
  console.log("\n⚡ Building all devices concurrently...");
  const startTime = Date.now();

  try {
    // Create all API instances and promises
    const buildPromises = generateConfigPaths.map(async (device) => {
      try {
        const crowdinAPI = new CrowdinAPI(device);
        await crowdinAPI.main();
        return { 
          device: device.id, 
          status: 'success' as const,
          fileName: device.FILE_NAME 
        };
      } catch (error) {
        return { 
          device: device.id, 
          status: 'error' as const,
          fileName: device.FILE_NAME,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Wait for all builds to complete (whether success or failure)
    const results = await Promise.allSettled(buildPromises);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Process results
    const successfulDevices: string[] = [];
    const failedDevices: Array<{ device: string; fileName: string; error: string }> = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const deviceResult = result.value;
        if (deviceResult.status === 'success') {
          successfulDevices.push(`${deviceResult.device} (${deviceResult.fileName})`);
        } else {
          failedDevices.push({
            device: deviceResult.device,
            fileName: deviceResult.fileName,
            error: deviceResult.error || 'Unknown error'
          });
        }
      } else {
        // This shouldn't happen since we catch errors in the promise, but just in case
        failedDevices.push({
          device: 'unknown',
          fileName: 'unknown',
          error: result.reason
        });
      }
    });

    return { successfulDevices, failedDevices, duration };

  } finally {
    // This will run regardless of success or failure
    console.log("\n" + "=".repeat(60));
  }
}
