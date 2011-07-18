//
//  SCUIViewController.m
//  SproutCoreNative
//
//  Created by Johannes Fahrenkrug on 18.07.11.
//  Copyright 2011 Springenwerk. All rights reserved.
//

#import "SCUIViewController.h"

@interface SCUIViewController(PrivateMethods)
- (void)setupJSEnvironment;
@end

@implementation SCUIViewController

- (id)init {
    return [self initWithNibName:nil bundle:nil];
}

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        scnEngine = [[SCNEngine alloc] init];
        [self setupJSEnvironment];
    }
    return self;
}

- (void)dealloc
{
    [scnEngine release];
    [super dealloc];
}

- (void)setupJSEnvironment {
    [scnEngine loadJSLibrary:@"domcore"];
    
    // set up fake window
    NSLog(@"setting up dom env...");
    [scnEngine runJS:@"this.prototype = core; window = this; window.document = new core.Document(); location = {href: 'http://localhost'}; window.document.prototype = core; window.addEventListener = (new core.Node()).addEventListener; window.navigator = {userAgent: 'Webkit'}; console = {log: SCN.log};"];
    
    [scnEngine loadJSLibrary:@"jquery-1.6.2"];
    [scnEngine loadJSLibrary:@"sproutcore"];
    [scnEngine loadJSLibrary:@"sproutcore-ui"];
    
    //create and compile the template
    [scnEngine runJS:@"var source   = \"Yo, {{fullName}}!\";\
     var template = Handlebars.compile(source);"];
    
    //set up the data
    [scnEngine runJS:@"var people = [{firstName: 'Charles', lastName: 'Jolley'}, {firstName: 'Yehuda', lastName: 'Katz'}, {firstName: 'Johannes', lastName: 'Fahrenkrug'}, {firstName: 'Tom', lastName: 'Dale'}, {firstName: 'Majd', lastName: 'Taby'}, {firstName: 'Colin', lastName: 'Campbell'}];"];
    
    //create an SC Person class
    [scnEngine runJS:@"Person = SC.Object.extend({firstName: null, lastName: null, fullName: function() {return this.get('firstName')+' '+this.get('lastName');}.property('firstName', 'lastName')});"];
    
    [scnEngine runJS:@"console.log('Done.');"];
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle


// Implement loadView to create a view hierarchy programmatically, without using a nib.
- (void)loadView
{
    NSLog(@"111111");
    [scnEngine runJS:@"navCtrl = UI.NavigationController.create();"];
    NSLog(@"22222");
    [scnEngine runJS:@"uiTemplate = \"{{#ui NavigationView controller=\\\"navCtrl\\\" anchorTo=\\\"left\\\" size=\\\"250\\\"}}<h2>List of items</h2>{{/ui}}\";"];
    NSLog(@"33333");
    [scnEngine runJS:@"currentContext = {}; uiHandlebar = Handlebars.compile(uiTemplate);"];
    NSLog(@"44444");
    [scnEngine runJS:@"uiHandlebar();"];
    
    self.view = [[[UIView alloc] initWithFrame:CGRectMake(0, 0, 320, 460)] autorelease];
}


/*
// Implement viewDidLoad to do additional setup after loading the view, typically from a nib.
- (void)viewDidLoad
{
    [super viewDidLoad];
}
*/

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
