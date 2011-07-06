//
//  HandlebarsTableViewController.h
//  SproutCoreNative
//
//  Created by Johannes Fahrenkrug on 06.07.11.
//  Copyright 2011 Springenwerk. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <JavaScriptCore/JavaScriptCore.h>


@interface HandlebarsTableViewController : UITableViewController {
    
}

+ (JSGlobalContextRef) globalJSContext;
+ (NSString *)runJS:(NSString *)aJSString;

@end
