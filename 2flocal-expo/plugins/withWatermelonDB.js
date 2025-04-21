const { withDangerousMod } = require('@expo/config-plugins');
const { resolve } = require('path');
const fs = require('fs');

// This plugin adds WatermelonDB native modules to the Expo project
const withWatermelonDB = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const filePath = resolve(config.modRequest.projectRoot, 'ios', config.modRequest.platformProjectRoot, 'Podfile');
      let podfileContent = fs.readFileSync(filePath, 'utf8');

      // Add WatermelonDB pod
      if (!podfileContent.includes("pod 'WatermelonDB'")) {
        const watermelonPod = `
  # WatermelonDB dependency
  pod 'WatermelonDB', :path => '../node_modules/@nozbe/watermelondb'
  pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi', :modular_headers => true
`;
        
        // Find the target line to add the pod
        const targetLine = "use_react_native!";
        podfileContent = podfileContent.replace(
          targetLine,
          `${targetLine}\n${watermelonPod}`
        );
        
        fs.writeFileSync(filePath, podfileContent);
      }
      
      return config;
    },
  ]);
};

module.exports = withWatermelonDB;