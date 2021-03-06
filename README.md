# annenmerge

Welcome to Annenmerge! Annenmerge is an app that helps students find others at Annenberg. By logging into our app via Facebook, you can immediately see where your Facebook friends are sitting at Annenberg and when they checked in. In the “Submit” tab, you can type in your table number and hit submit to check in yourself to a table. Finally, in the “Settings” tab, you can find out which table you’re currently registered to and can also log out. In order to run our app, follow the instructions below.


Our project was built through Exponent, a free and open source platform that lets web developers develop mobile apps that work across both iOS and Android platforms. The collaboration was done through a GitHub repository. We uploaded all the files in the repository into the CS50 IDE in order to submit our project the standard way. This folder not only contains the source code (in Javascript), but also the final APK file that can be downloaded and run on Android phones.


Note: an IPA file is not included because it cannot be test run on an iPhone anyways per Apple’s rules. However, our app is compatible with both Android phones and iPhones. 


As implied in the above paragraphs, there are two primary ways of running our app. 


1. Opening the APK file on an Android device
2. Setting up Exponent XDE and a phone simulator on a computer


Since we are still in the process of getting our app on the App Store and the Play Store, those are the only two ways of running the app. We hope to have the app finalized by the beginning of next semester. We highly recommend using the APK file to run the app as each computer might run into minor issues when setting up the Exponent XDE environment (Exponent is still a piece of software that is constantly being updated—there was one bug that wouldn’t allow us to republish our app that just got fixed a few days ago). In addition, it takes time to set everything up. However, both methods should definitely work. If you run into any issues with setting up the computer environment, please feel free to email us at jdhe@college.harvard.edu and phanaj@college.harvard.edu or look up the Exponent Documentation (https://docs.getexponent.com/versions/v12.0.0/index.html). 


1. Using APK File:

	a. Navigate to Settings -> Security and ensure that installation of apps from unknown sources is enabled.
	b. On your Android phone, download the APK File here: https://exp-shell-app-assets.s3-us-west-1.amazonaws.com/android%2F%40jdhe1120%2Fannenmerge-c956fafa-bb6e-11e6-a69c-0a580a443b0e-signed.apk
	c. Tap the downloaded APK and select “Install”. 
	d. Annenmerge is now in your Apps folder!
	e. After running the app, feel free to change your security settings back!
  
  2. Using source code:


In order to test our app using source code, you will need to use the Exponent Development Environment (Exponent XDE) and either
	a. An android emulator on your computer
	b. An iOS simulator on your computer
	c. A phone with the Exponent mobile app downloaded

Here are the full steps:

1. Download the Exponent XDE by following the instructions here (for the Desktop Development Tool) https://docs.getexponent.com/versions/v11.0.0/introduction/installation.html# 
2. Download either the mobile app, andorid simulator, or iPhone simulator by following the instructions here (Mobile Client: Exponent for iOS and Android) https://docs.getexponent.com/versions/v11.0.0/introduction/installation.html#
3. This is already on the website, but just in case
a. Mobile app is available for Android 4.4+ from the Play Store or for iOS 8+ from the App Store
b. iOS simulator requires Xcode
c. Android simulator requires Genymotion
4. Download Node.js https://nodejs.org/en/ 
a. This is because our project utilizes npm, a package managing system that allows people to use open source libraries in their projects
5. Mac users
a. Exponent notes that some Mac users experience issues without Watchman, which is used internally by React Native
b. https://facebook.github.io/watchman/docs/install.html 
6. Now that installation of the software to run the project is complete, download this entire folder.
7. Navigate to your local copy of this folder in the command line interface and run “npm install”. This will install all the packages specified in the package.json file, which are required to make the project run.
8. Open Exponent XDE on your computer and click file and open project. Navigate to the your local copy of this folder and select it to open.
9. Now, a link will appear at the top of Exponent XDE. 
a. If using your mobile device, open the Exponent mobile app and type in the link. You will now gain access to the app.
b. If using an Android simulator, click “device” at the upper right and click open with Android simulator.
c. If using an iOS simulator, click “device” at the upper right and click open with iOS simulator.
