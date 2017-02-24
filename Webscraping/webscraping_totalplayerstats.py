from lxml import html
import requests, sys, os, re, operator, math, csv
#In order to run this file, make sure to install the libxml2, lxml, and requests packages.

reload(sys)
sys.setdefaultencoding('utf-8') #Done to handle odd non-ascii characters in player names simply.

#I inputted all of the player_Ids from hltv.org by hand, since I couldn't find anywhere to scrape them from.
player_Ids = ['7938', '5736', '8950', '8575', '7708', '9001', '8714', '1088', '8944', '9352', '8565', '7028', '5187', '8412', '8783', '180',
              '8994', '9960', '7026', '9172', '8943', '8601', '8957', '9031', '8574', '10588', '5799', '10394', '9247', '5021', '8604', '5480',
              '8789', '9288']       #List has gone up to dupreeh in list of all players

valid_Player_Ids = [ ]  #In case we input a playerID who did not play a game at the given event, then that ID will not be output to the csv.
player_Names = [ ]      #Nicknames like coldzera.
kills = [ ]
headshots = [ ]
deaths = [ ]
rounds_Played = [ ]
assists = [ ]
birth_Names = [ ]       #Birth names like Marcelo David.
ages = [ ]
countries = [ ]
teams = [ ]

#Comment out line 38 in gulpfile.js if you want to start the server using gulp command to load the css

def get_player_stats(page_url, player_Id):
        page = requests.get(page_url)
        content = html.fromstring(page.content)
        name = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[1]/div[2]/text()")
        kill = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[3]/div/div[2]/text()")
        headshot = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[5]/div/div[2]/text()")
        death = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[7]/div/div[2]/text()")
        rounds = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[13]/div/div[2]/text()")
        assistsARound = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[3]/div[2]/div[17]/div/div[2]/text()")
        realName = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[3]/div/div[3]/div/text()")
        age = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[5]/div/div[2]/text()")
        country = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[7]/div/div[2]/text()")
        team = content.xpath("//*[@id='back']/div[3]/div[3]/div/div[2]/div[2]/div[9]/div/div[2]/a/text()")
        if (player_Id % 100 == 0):
                print(player_Id)
        
        
        if (len(rounds) > 0 and int(rounds[0]) > 0 and len(name) > 0 and name[0] != 'N/A' and len(kill) > 0 and kill[0] > 0):
                valid_Player_Ids.append(player_Id)
                player_Names.append(name[0])
                
                kills.append(int(kill[0]))
                if (len(headshot) > 0):
                        headshots.append(headshot[0])
                else:
                        headshots.append('0')
                if (len(death) > 0):
                        deaths.append(int(death[0]))
                else:
                        deaths.append(0)
                
                rounds_Played.append(int(rounds[0]))
                
                if (len(assistsARound) > 0):
                        totalAssist = int(int(rounds[0]) * float(assistsARound[0]))
                else:
                        totalAssist = 0
                
                assists.append(totalAssist)
                if (len(realName) > 0):
                        birth_Names.append(realName[0])
                else:
                        birth_Names.append('Unknown')
                
                if (age[0] == '-'):
                        ages.append('-')
                else:
                        ages.append(int(age[0]))
                if (len(countries) > 0):
                        countries.append(country[0].strip()) #Strip() removes leading/ending whitespace.
                else:
                        countries.append('Unkown')
                if (len(team) > 0):
                        teams.append(team[0])
                else:
                        teams.append('No team')

#14000 max
for i in range (12560, 13365):
    get_player_stats('http://www.hltv.org/?pageid=173&playerid=' + str(i), i)


print("data retrieved")


fileName = 'AllStats.csv'

with open(fileName, 'a') as csvfile:   #w+ means it will create the file if there is not one, or rewrite it if there is. If you want to append to file, use a+.
        spamwriter = csv.writer(csvfile, delimiter=',',
                                                        quotechar='"', quoting=csv.QUOTE_MINIMAL)
        #spamwriter.writerow(["Name", "PlayerID", "Kills", "Headshot%", "Deaths", "Rounds Played", "Assists", "Birth Name", "Age", "Country", "Current Team"])
        for i in range(0, len(valid_Player_Ids)):
                spamwriter.writerow([player_Names[i], valid_Player_Ids[i], kills[i], headshots[i], deaths[i], rounds_Played[i],
                                                         assists[i], birth_Names[i], ages[i], countries[i], teams[i]])