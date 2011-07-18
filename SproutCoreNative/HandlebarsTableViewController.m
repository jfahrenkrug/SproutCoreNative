//
//  HandlebarsTableViewController.m
//  SproutCoreNative
//
//  Created by Johannes Fahrenkrug on 06.07.11.
//  Copyright 2011 Springenwerk. All rights reserved.
//

#import "HandlebarsTableViewController.h"

@implementation HandlebarsTableViewController



- (id)initWithStyle:(UITableViewStyle)style
{
    self = [super initWithStyle:style];
    if (self) {
        // Custom initialization
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
    [scnEngine loadJSLibrary:@"sproutcore-2.0.beta.1"];
    
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
    NSString* length = [scnEngine runJS:@"people.length;"];
    
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
    cell.textLabel.text = [scnEngine runJS:[NSString stringWithFormat:@"template({fullName: Person.create(people[%i]).get('fullName')});", indexPath.row]];
    
    return cell;
}


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
