//
//  HandlebarsTableViewController.m
//  SproutCoreNative
//
//  Created by Johannes Fahrenkrug on 06.07.11.
//  Copyright 2011 Springenwerk. All rights reserved.
//

#import "HandlebarsTableViewController.h"

@implementation HandlebarsTableViewController

static JSGlobalContextRef gGlobalJSContext = NULL;
static JSClassRef  gSCNClass = NULL;

static JSValueRef __SCNLogMethod(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) 
{
    JSValueRef excp = NULL;
    if(argumentCount > 0) {
        NSLog(@"JS LOG: %@", 
              (NSString*)JSStringCopyCFString(kCFAllocatorDefault, (JSStringRef)JSValueToStringCopy(ctx, arguments[0], &excp)));        
    }

    return JSValueMakeNull(ctx);
}

static JSValueRef __SCNToStringMethod(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) 
{
    return JSValueMakeString(ctx, JSStringCreateWithUTF8CString([@"The SproutCoreNative object." UTF8String]));
}

static JSValueRef __SCNGetProperty(JSContextRef ctx, JSObjectRef object, JSStringRef propertyNameJS, JSValueRef* exception) {
    NSString *propertyName = (NSString*)JSStringCopyCFString(kCFAllocatorDefault, propertyNameJS);
    if([propertyName isEqualToString:@"log"]) {
        return JSObjectMakeFunctionWithCallback(ctx, propertyNameJS, __SCNLogMethod);
    } else if ([propertyName isEqualToString:@"toString"]) {
        return JSObjectMakeFunctionWithCallback(ctx, propertyNameJS, __SCNToStringMethod);
    }
    NSLog(@"undefined property %@", propertyName);
    return JSValueMakeNull(ctx);
}

- (id)initWithStyle:(UITableViewStyle)style
{
    self = [super initWithStyle:style];
    if (self) {
        // Custom initialization
    }
    return self;
}

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

+ (JSGlobalContextRef) globalJSContext 
{
	if (gGlobalJSContext == NULL) {
		gGlobalJSContext = JSGlobalContextCreate(NULL);      
        
        JSClassDefinition jsClass = kJSClassDefinitionEmpty;
        jsClass.getProperty	= __SCNGetProperty;
        gSCNClass = JSClassCreate(&jsClass);
        
        JSObjectRef global = JSContextGetGlobalObject(gGlobalJSContext);
        JSObjectRef obj = JSObjectMake(gGlobalJSContext, gSCNClass, nil);
        JSStringRef property = JSStringCreateWithUTF8CString([@"SCN" UTF8String]);
        JSValueRef exception = NULL;
        JSObjectSetProperty(gGlobalJSContext, global, property, (JSValueRef)obj, kJSPropertyAttributeDontDelete, &exception);
                        
        [[self class] loadJSLibrary:@"domcore"];
        
        // set up fake window
        NSLog(@"setting up dom env...");
        [self runJS:@"this.prototype = core; window = this; window.document = new core.Document(); location = {href: 'http://localhost'}; window.document.prototype = core; window.addEventListener = (new core.Node()).addEventListener; window.navigator = {userAgent: 'Webkit'}; console = {log: SCN.log};"];
                
        [[self class] loadJSLibrary:@"jquery-1.6.2"];
        [[self class] loadJSLibrary:@"sproutcore-2.0.beta.1"];
            
        //create and compile the template
        [self runJS:@"var source   = \"Yo, {{fullName}}!\";\
                      var template = Handlebars.compile(source);"];
        
        //set up the data
        [self runJS:@"var people = [{firstName: 'Charles', lastName: 'Jolley'}, {firstName: 'Yehuda', lastName: 'Katz'}, {firstName: 'Johannes', lastName: 'Fahrenkrug'}, {firstName: 'Tom', lastName: 'Dale'}, {firstName: 'Majd', lastName: 'Taby'}, {firstName: 'Colin', lastName: 'Campbell'}];"];
        
        //create an SC Person class
        [self runJS:@"Person = SC.Object.extend({firstName: null, lastName: null, fullName: function() {return this.get('firstName')+' '+this.get('lastName');}.property('firstName', 'lastName')});"];
        
        [self runJS:@"console.log('Done.');"];
	}
	
	return gGlobalJSContext;
}

+ (NSString *)runJS:(NSString *)aJSString 
{
    if (!aJSString) {
        NSLog(@"JS String is empty!");
        return nil;
    }
    
    
    JSStringRef scriptJS = JSStringCreateWithUTF8CString([aJSString UTF8String]);
    JSValueRef exception = NULL;
    
    JSValueRef result = JSEvaluateScript([self globalJSContext], scriptJS, NULL, NULL, 0, &exception); 
    NSString *res = nil;
    
    if (!result) {
        if (exception) {
            JSStringRef exceptionArg = JSValueToStringCopy([self globalJSContext], exception, NULL);
            NSString* exceptionRes = (NSString*)JSStringCopyCFString(kCFAllocatorDefault, exceptionArg); 
            
            JSStringRelease(exceptionArg);
            NSLog(@"JavaScript exception: %@", exceptionRes);
        }
        
        NSLog(@"No result returned");
    } else {
        JSStringRef jstrArg = JSValueToStringCopy([self globalJSContext], result, NULL);
        res = (NSString*)JSStringCopyCFString(kCFAllocatorDefault, jstrArg); 
        
        JSStringRelease(jstrArg);
    }
    
    JSStringRelease(scriptJS);
    
    return res;
}

+ (void)loadJSLibrary:(NSString*)libraryName {
    NSString *library = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:libraryName ofType:@"js"]  encoding:NSUTF8StringEncoding error:nil];
    
    NSLog(@"loading library %@...", libraryName);
    [self runJS:library];  
}


#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];

    // Uncomment the following line to preserve selection between presentations.
    // self.clearsSelectionOnViewWillAppear = NO;
 
    // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
    // self.navigationItem.rightBarButtonItem = self.editButtonItem;
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
    [super viewDidDisappear:animated];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    // Return the number of sections.
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    // Return the number of rows in the section.
    NSString* length = [[self class] runJS:@"people.length;"];
    
    return [length intValue];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier] autorelease];
    }
    
    // Configure the cell...
    // Create instance of Person class and get its fullName property and pass that to the Handlebars template
    cell.textLabel.text = [[self class] runJS:[NSString stringWithFormat:@"template({fullName: Person.create(people[%i]).get('fullName')});", indexPath.row]];
    
    return cell;
}

/*
// Override to support conditional editing of the table view.
- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Return NO if you do not want the specified item to be editable.
    return YES;
}
*/

/*
// Override to support editing the table view.
- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        // Delete the row from the data source
        [tableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath] withRowAnimation:UITableViewRowAnimationFade];
    }   
    else if (editingStyle == UITableViewCellEditingStyleInsert) {
        // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
    }   
}
*/

/*
// Override to support rearranging the table view.
- (void)tableView:(UITableView *)tableView moveRowAtIndexPath:(NSIndexPath *)fromIndexPath toIndexPath:(NSIndexPath *)toIndexPath
{
}
*/

/*
// Override to support conditional rearranging of the table view.
- (BOOL)tableView:(UITableView *)tableView canMoveRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Return NO if you do not want the item to be re-orderable.
    return YES;
}
*/

#pragma mark - Table view delegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    // Navigation logic may go here. Create and push another view controller.
    /*
     <#DetailViewController#> *detailViewController = [[<#DetailViewController#> alloc] initWithNibName:@"<#Nib name#>" bundle:nil];
     // ...
     // Pass the selected object to the new view controller.
     [self.navigationController pushViewController:detailViewController animated:YES];
     [detailViewController release];
     */
}

@end
