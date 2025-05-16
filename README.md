# TabbyGroup

TabbyGroup is a Chrome extension that automatically groups tabs in the browser. It learns from user-created tab groups and automatically adds similar URLs to the same groups.

## Features

- Tracks existing tab groups created by the user
- Learns URLs within groups and adds similar URLs to the same group
- Can create a new group with the same name when an old group is closed
- Requires no user interface - works entirely in the background

## Usage

1. After installing the extension, **you must first manually create tab groups**. The extension only learns from existing groups and adds similar tabs to them.

### How to Create a Tab Group:

1. Open several tabs in Chrome (e.g., different GitHub pages)
2. Select the tabs with your mouse:
   - To select multiple adjacent tabs, click on the first tab, then hold SHIFT and click on the last tab
   - To select non-adjacent tabs, hold CTRL and click on each tab you want to select
3. Right-click on the selected tabs
4. Select "Add tabs to group" > "New group" from the menu
5. Give the group a name (e.g., "Development", "Work", "Social Media", etc.)
6. To assign a color to the group, click on the colored circle next to the group name

Suggested group examples:
- Group all GitHub tabs under a "Development" group
- Group different email services under an "Email" group
- Group social media sites under a "Social" group
- Group shopping sites under a "Shopping" group

### How the Extension Works:

1. After manually creating groups, TabbyGroup learns these groups and the URLs within them
2. When you open a website in a new tab, the extension automatically moves this tab to an appropriate group
3. If a website matches the URL pattern of multiple groups, the extension uses the first matching group
4. If you delete a group and open a new tab with the same URLs, the extension automatically creates a new group with the same name

### Tips:

- For best results, first create distinct, well-defined tab groups
- Open at least a few tabs in a group for the extension to learn the URLs
- You can collapse and expand groups by clicking on the arrow next to the group name
- To remove a tab from a group, right-click on the tab and select "Remove from group"
- When a URL is in an existing group, all new tabs with the same URL will be added to that group
