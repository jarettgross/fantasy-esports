from lxml import html
import requests, sys, os, re, operator, math, csv
#In order to run this file, make sure to install the libxml2, lxml, and requests packages.

reload(sys)
sys.setdefaultencoding('utf-8')	#Done to handle odd non-ascii characters in player names simply.

#I inputted all of the player_Ids from hltv.org by hand, since I couldn't find anywhere to scrape them from.
player_Ids = ['9216', '7594', '2553', '334', '7592', '7167', '9032', '8738' '9261', '8564', '7998', '8394', '1225', '7169', '8918', '7805', '3741',
			  '695', '483', '161', '7528', '7412', '317', '3849', '3347', '7168', '3055', '8374', '339', '2469', '7154', '7322', '7398', '7443',
			  '429', '1485', '629', '8528', '2757', '964', '3847', '338', '885', '8183', '4959', '4954', '484', '5386', '2023', '8346', '6904',
			  '7429', '2730', '8095', '8520', '9078', '8507', '472', '735', '1146', '165', '3997', '8413', '9217', '9256', '8370', '7511', '7390',
			  '2644', '7687', '7403', '7796', '8523', '8716', '2131', '147', '7156', '41', '7499', '7170', '798', '7440', '8797', '9219', '29', '8735',
			  '8248', '39', '7527', '8349', '203', '7148', '884', '557', '8738', '8345', '5287', '1866', '7256', '499', '21']
#fox/jkaem=Faze, RUBINO=North
event_Ids = ['2062']	#Currently only 1 event_Id. If we want multiple events in one scrape, then I'll have to modify how we store the data a bit.
event_Names = ['ESL One Cologne 2016']

valid_Player_Ids = [ ]	#In case we input a playerID who did not play a game at the given event, then that ID will not be output to the csv.
player_Names = [ ]	#Nicknames like coldzera.
kills = [ ]
headshots = [ ]
deaths = [ ]
rounds_Played = [ ]
damage = [ ]
assists = [ ]
birth_Names = [ ]	#Birth names like Marcelo David.
ages = [ ]
countries = [ ]
teams = [ ]

def get_player_stats(page_url, player_Id):
	page = requests.get(page_url)
	content = html.fromstring(page.content)
	name = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[1]/div[2]/text()")
	kill = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[3]/div/div[2]/text()")
	headshot = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[5]/div/div[2]/text()")
	death = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[7]/div/div[2]/text()")
	rounds = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[13]/div/div[2]/text()")
	damageARound = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[17]/div/div[2]/text()")
	assistsARound = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[23]/div/div[2]/text()")
	realName = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[3]/div/div[3]/div/text()")
	age = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[5]/div/div[2]/text()")
	country = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[7]/div/div[2]/text()")
	team = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[9]/div/div[2]/a/text()")
	
	#Based off of the # of rounds, since if you don't play a around you can't collect any other stats for this event.
	if (len(rounds) > 0 and int(rounds[0]) > 0):
		valid_Player_Ids.append(player_Id)
		player_Names.append(name[0])
		kills.append(int(kill[0]))
		headshots.append(headshot[0])
		deaths.append(int(death[0]))
		rounds_Played.append(int(rounds[0]))
		
		totalDamage = int(int(rounds[0]) * float(damageARound[0]))
		totalAssist = int(int(rounds[0]) * float(assistsARound[0]))
		
		damage.append(totalDamage)
		assists.append(totalAssist)
		birth_Names.append(realName[0])
		if (age[0] == '-'):
			ages.append('-')
		else:
			ages.append(int(age[0]))
		countries.append(country[0].strip()) #Strip() removed leading/ending whitespace.
		teams.append(team[0])


for event in event_Ids:
    for i in range (0, len(player_Ids)):
        get_player_stats('http://www.hltv.org/?pageid=173&playerid=' + player_Ids[i] + '&eventid=' + event, player_Ids[i])
  

print("data retrieved")


fileName = event_Names[0] + '.csv'

with open(fileName, 'w+') as csvfile:	#w+ means it will create the file if there is not one, or rewrite it if there is. If you want to append to file, use a+.
	spamwriter = csv.writer(csvfile, delimiter=',',
							quotechar='"', quoting=csv.QUOTE_MINIMAL)
	spamwriter.writerow(["Name", "PlayerID", "Kills", "Headshot%", "Deaths", "Rounds Played", "Damage", "Assists", "Birth Name", "Age", "Country", "Team"])
	for i in range(0, len(valid_Player_Ids)):
		spamwriter.writerow([player_Names[i], valid_Player_Ids[i], kills[i], headshots[i], deaths[i], rounds_Played[i], damage[i],
							 assists[i], birth_Names[i], ages[i], countries[i], teams[i]])