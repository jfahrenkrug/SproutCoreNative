//
//  SproutCoreNativeAppDelegate.h
//  SproutCoreNative
//
//  Created by Johannes Fahrenkrug on 06.07.11.
//  Copyright 2011 Springenwerk. All rights reserved.
//

#import <UIKit/UIKit.h>

@class HandlebarsTableViewController;

@interface SproutCoreNativeAppDelegate : NSObject <UIApplicationDelegate> {

}

@property (nonatomic, retain) IBOutlet UIWindow *window;

@property (nonatomic, retain) IBOutlet HandlebarsTableViewController *viewController;

@end
