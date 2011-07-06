//
//  SproutCoreNativeViewController.m
//  SproutCoreNative
//
//  Created by Johannes Fahrenkrug on 06.07.11.
//  Copyright 2011 Springenwerk. All rights reserved.
//

#import "SproutCoreNativeViewController.h"
#import <JavaScriptCore/JavaScriptCore.h>

@implementation SproutCoreNativeViewController

- (void)dealloc
{
    [super dealloc];
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle


// Implement viewDidLoad to do additional setup after loading the view, typically from a nib.
- (void)viewDidLoad
{
    [super viewDidLoad];
    
    NSString *handlebars = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"handlebars.1.0.0.beta.3" ofType:@"js"]  encoding:NSUTF8StringEncoding error:nil];
    
    JSGlobalContextRef ctx = JSGlobalContextCreate(NULL);
    
    //evalute handlebars 
    JSStringRef handlebarsJS = JSStringCreateWithUTF8CString([handlebars UTF8String]);
    JSEvaluateScript(ctx, handlebarsJS, NULL, NULL, 1, NULL);
    
    //pass a javascript code
    JSStringRef scriptJS = JSStringCreateWithUTF8CString("var source   = \"<p>{{lastName}}, {{firstName}}</p>\";\
                                                         var template = Handlebars.compile(source);\
                                                         return template({firstName: \"Johannes\", lastName: \"Fahrenkrug\"});");
    JSObjectRef fn = JSObjectMakeFunction(ctx, NULL, 0, NULL, scriptJS, NULL, 1, NULL);
    JSValueRef result = JSObjectCallAsFunction(ctx, fn, NULL, 0, NULL, NULL);
    
    JSStringRef     jstrArg = JSValueToStringCopy(ctx, result, NULL);
    
    NSString* hello   =  (NSString*)JSStringCopyCFString(kCFAllocatorDefault, jstrArg);  
    
    JSStringRelease(jstrArg);
    JSStringRelease(scriptJS);
    JSStringRelease(handlebarsJS);
    
    NSLog(@"Hello from JS: %@", hello);
}


- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

@end
