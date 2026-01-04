// Hijri Calendar JavaScript

// Global variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Islamic months with descriptions
const islamicMonths = [
  { 
    name: "Muharram",
    arabic: "مُحَرَّم",
    description: "The first month of the Islamic calendar. It is one of the four sacred months during which warfare is forbidden. The 10th day, Ashura, is significant for both Sunni and Shia Muslims."
  },
  { 
    name: "Safar",
    arabic: "صَفَر",
    description: "The second Islamic month. Its name means 'empty' referring to the time when houses were empty as people traveled for trade. Some cultural superstitions about this month have no basis in Islamic teachings."
  },
  { 
    name: "Rabi' al-Awwal",
    arabic: "رَبِيع ٱلْأَوَّل",
    description: "The month in which Prophet Muhammad (ﷺ) was born. Many Muslims celebrate Mawlid al-Nabi on the 12th of this month. It marks the beginning of spring in Arabic."
  },
  { 
    name: "Rabi' al-Thani",
    arabic: "رَبِيع ٱلثَّانِي",
    description: "Also known as Rabi' al-Akhir. This month continues the spring season. It's a time for reflection on the Prophet's teachings and strengthening faith."
  },
  { 
    name: "Jumada al-Awwal",
    arabic: "جُمَادَىٰ ٱلْأُولَىٰ",
    description: "The fifth month. The name comes from 'jamada' meaning to freeze, as it typically falls in winter when water freezes. It's a time for increased prayer and charity."
  },
  { 
    name: "Jumada al-Thani",
    arabic: "جُمَادَىٰ ٱلثَّانِيَة",
    description: "The sixth month, also called Jumada al-Akhirah. Completes the winter season. Many historical Islamic battles occurred during this month."
  },
  { 
    name: "Rajab",
    arabic: "رَجَب",
    description: "The seventh month and one of the four sacred months. The 27th night marks Isra and Mi'raj - the Prophet's night journey and ascension to heaven."
  },
  { 
    name: "Sha'ban",
    arabic: "شَعْبَان",
    description: "The eighth month. The 15th night is Laylat al-Bara'ah (Night of Forgiveness). Prophet Muhammad (ﷺ) used to fast frequently during this month in preparation for Ramadan."
  },
  { 
    name: "Ramadan",
    arabic: "رَمَضَان",
    description: "The ninth and holiest month. Muslims fast from dawn to sunset. The Quran was revealed during this month. Contains Laylat al-Qadr (Night of Power), better than 1000 months."
  },
  { 
    name: "Shawwal",
    arabic: "شَوَّال",
    description: "The tenth month. The first day is Eid al-Fitr, celebrating the end of Ramadan. Fasting six days during this month brings great reward, equivalent to fasting the entire year."
  },
  { 
    name: "Dhu al-Qi'dah",
    arabic: "ذُو ٱلْقَعْدَة",
    description: "The eleventh month and one of the four sacred months. Its name means 'Master of Truce' as it was a month when fighting ceased, allowing for pilgrimage preparation."
  },
  { 
    name: "Dhu al-Hijjah",
    arabic: "ذُو ٱلْحِجَّة",
    description: "The twelfth and final month. Contains Hajj pilgrimage and Eid al-Adha. The first ten days are the most blessed days of the year. Fasting on the Day of Arafah expiates sins of two years."
  }
];

// Weekday names
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fullWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Islamic events data
const islamicEvents = {
  "01-10": { 
    name: "Ashura", 
    month: "Muharram", 
    description: "Day of Ashura - fasting recommended"
  },
  "03-12": { 
    name: "Mawlid al-Nabi", 
    month: "Rabi' al-Awwal", 
    description: "Prophet Muhammad's Birthday"
  },
  "07-27": { 
    name: "Isra and Mi'raj", 
    month: "Rajab", 
    description: "Night Journey and Ascension"
  },
  "08-15": { 
    name: "Laylatul Bara'ah", 
    month: "Sha'ban", 
    description: "Night of Forgiveness"
  },
  "09-01": { 
    name: "First of Ramadan", 
    month: "Ramadan", 
    description: "Beginning of fasting month"
  },
  "09-27": { 
    name: "Laylatul Qadr", 
    month: "Ramadan", 
    description: "Night of Power"
  },
  "10-01": { 
    name: "Eid al-Fitr", 
    month: "Shawwal", 
    description: "Festival of Breaking Fast"
  },
  "12-08": { 
    name: "Hajj begins", 
    month: "Dhu al-Hijjah", 
    description: "Pilgrimage to Mecca"
  },
  "12-09": { 
    name: "Day of Arafah", 
    month: "Dhu al-Hijjah", 
    description: "Day of Arafah - fasting recommended"
  },
  "12-10": { 
    name: "Eid al-Adha", 
    month: "Dhu al-Hijjah", 
    description: "Festival of Sacrifice"
  }
};

// Function to convert Gregorian to Hijri (approximation)
function gregorianToHijri(date) {
  const startIslamic = new Date(622, 6, 16);
  const diffTime = date - startIslamic;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const hijriYear = Math.floor(diffDays / 354.366);
  const hijriDay = Math.floor(diffDays % 354.366);
  
  let month = 0;
  let day = hijriDay;
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  
  for (let i = 0; i < monthLengths.length; i++) {
    if (day < monthLengths[i]) {
      month = i;
      break;
    }
    day -= monthLengths[i];
  }
  
  return {
    year: hijriYear + 1,
    month: month + 1,
    monthName: islamicMonths[month].name,
    monthArabic: islamicMonths[month].arabic,
    monthDesc: islamicMonths[month].description,
    day: day + 1
  };
}

// Function to update current date display
function updateCurrentDate() {
  const now = new Date();
  
  // Update Gregorian date
  const gregorianOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const gregorianFormatted = now.toLocaleDateString('en-US', gregorianOptions);
  document.getElementById('gregorian-date').textContent = gregorianFormatted;
  
  // Update Hijri date
  const hijriDate = gregorianToHijri(now);
  const hijriFormatted = `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} AH`;
  document.getElementById('hijri-date').textContent = hijriFormatted;
  
  // Update current time
  const timeFormatted = now.toLocaleTimeString('en-US', { hour12: false });
  document.getElementById('current-time').textContent = timeFormatted;
  
  // Update current day
  const dayFormatted = fullWeekdays[now.getDay()];
  document.getElementById('current-day').textContent = dayFormatted;
  
  // Update month description
  updateMonthDescription(hijriDate);
}

// Function to update month description
function updateMonthDescription(hijriDate) {
  const monthDescElement = document.getElementById('current-month-desc');
  if (monthDescElement) {
    monthDescElement.innerHTML = `
      <strong>${hijriDate.monthName} (${hijriDate.monthArabic})</strong> - ${hijriDate.monthDesc}
    `;
  }
}

// Function to generate calendar
function generateCalendar(month, year) {
  const calendarDays = document.getElementById('calendar-days');
  calendarDays.innerHTML = '';
  
  // Update month display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
  
  // Get first day of month
  const firstDay = new Date(year, month, 1);
  const firstDayIndex = firstDay.getDay();
  
  // Get last day of month
  const lastDay = new Date(year, month + 1, 0);
  const lastDate = lastDay.getDate();
  
  // Get previous month last date
  const prevLastDay = new Date(year, month, 0);
  const prevLastDate = prevLastDay.getDate();
  
  // Get next month days
  const nextDays = 7 - ((firstDayIndex + lastDate) % 7);
  
  // Previous month days
  for (let i = firstDayIndex; i > 0; i--) {
    const day = document.createElement('div');
    day.classList.add('calendar-day', 'other-month');
    day.textContent = prevLastDate - i + 1;
    
    // Add Hijri date for previous month days
    const prevDate = new Date(year, month - 1, prevLastDate - i + 1);
    const hijriDate = gregorianToHijri(prevDate);
    const hijriSpan = document.createElement('span');
    hijriSpan.classList.add('hijri-date-small');
    hijriSpan.textContent = `${hijriDate.day} ${hijriDate.monthName.substring(0, 3)}`;
    day.appendChild(hijriSpan);
    
    calendarDays.appendChild(day);
  }
  
  // Current month days
  const today = new Date();
  for (let i = 1; i <= lastDate; i++) {
    const day = document.createElement('div');
    day.classList.add('calendar-day');
    day.textContent = i;
    
    // Highlight today
    if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      day.classList.add('today');
    }
    
    // Check for Islamic events
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = i.toString().padStart(2, '0');
    const dateKey = `${monthStr}-${dayStr}`;
    
    // Add event indicator if exists
    if (islamicEvents[dateKey]) {
      const eventIndicator = document.createElement('div');
      eventIndicator.classList.add('event-indicator');
      eventIndicator.title = islamicEvents[dateKey].name;
      day.appendChild(eventIndicator);
      
      // Add event name on hover
      day.setAttribute('data-event', islamicEvents[dateKey].name);
    }
    
    // Add Hijri date
    const hijriDate = gregorianToHijri(new Date(year, month, i));
    const hijriSpan = document.createElement('span');
    hijriSpan.classList.add('hijri-date-small');
    hijriSpan.textContent = `${hijriDate.day} ${hijriDate.monthName.substring(0, 3)}`;
    day.appendChild(hijriSpan);
    
    calendarDays.appendChild(day);
  }
  
  // Next month days
  for (let i = 1; i <= nextDays; i++) {
    const day = document.createElement('div');
    day.classList.add('calendar-day', 'other-month');
    day.textContent = i;
    
    // Add Hijri date for next month days
    const nextDate = new Date(year, month + 1, i);
    const hijriDate = gregorianToHijri(nextDate);
    const hijriSpan = document.createElement('span');
    hijriSpan.classList.add('hijri-date-small');
    hijriSpan.textContent = `${hijriDate.day} ${hijriDate.monthName.substring(0, 3)}`;
    day.appendChild(hijriSpan);
    
    calendarDays.appendChild(day);
  }
}

// Function to update upcoming events
function updateUpcomingEvents() {
  const now = new Date();
  const eventsList = document.querySelector('.events-list');
  
  // Clear existing events (except sample ones)
  const sampleEvents = document.querySelectorAll('.event-item');
  if (sampleEvents.length > 3) {
    for (let i = 3; i < sampleEvents.length; i++) {
      sampleEvents[i].remove();
    }
  }
  
  // Add real upcoming events (next 30 days)
  for (let i = 0; i < 30; i++) {
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + i);
    
    const monthStr = (futureDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = futureDate.getDate().toString().padStart(2, '0');
    const dateKey = `${monthStr}-${dayStr}`;
    
    if (islamicEvents[dateKey]) {
      const event = islamicEvents[dateKey];
      
      // Check if this event is already in the list
      const existingEvents = document.querySelectorAll('.event-info h4');
      let exists = false;
      existingEvents.forEach(existing => {
        if (existing.textContent.includes(event.name)) {
          exists = true;
        }
      });
      
      if (!exists) {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');
        
        // Get Hijri date for the event
        const hijriDate = gregorianToHijri(futureDate);
        
        eventItem.innerHTML = `
          <div class="event-date">
            <span class="event-day">${hijriDate.day}</span>
            <span class="event-month">${hijriDate.monthName.substring(0, 3)}</span>
          </div>
          <div class="event-info">
            <h4>${event.name}</h4>
            <p>${event.description}</p>
            <small>${futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>
          </div>
        `;
        
        eventsList.appendChild(eventItem);
      }
    }
  }
}

// Function to display all Islamic months with descriptions
function displayAllMonths() {
  const monthsGrid = document.getElementById('islamic-months-grid');
  if (!monthsGrid) return;
  
  monthsGrid.innerHTML = '';
  
  islamicMonths.forEach((month, index) => {
    const monthCard = document.createElement('div');
    monthCard.classList.add('month-card');
    
    // Highlight current month
    const currentHijri = gregorianToHijri(new Date());
    if (currentHijri.month - 1 === index) {
      monthCard.classList.add('current-month');
    }
    
    monthCard.innerHTML = `
      <div class="month-header">
        <div class="month-number">${index + 1}</div>
        <div class="month-names">
          <h4>${month.name}</h4>
          <div class="month-arabic">${month.arabic}</div>
        </div>
      </div>
      <div class="month-description">
        <p>${month.description}</p>
      </div>
      <div class="month-significance">
        <div class="significance-item">
          <i class="fas ${getMonthIcon(index)}"></i>
          <span>${getMonthSignificance(index)}</span>
        </div>
      </div>
    `;
    
    monthsGrid.appendChild(monthCard);
  });
}

// Helper function to get appropriate icon for each month
function getMonthIcon(monthIndex) {
  const icons = [
    'fa-star', 'fa-moon', 'fa-baby', 'fa-seedling',
    'fa-snowflake', 'fa-mountain', 'fa-star-and-crescent',
    'fa-hands-praying', 'fa-moon-stars', 'fa-star',
    'fa-hands', 'fa-kaaba'
  ];
  return icons[monthIndex] || 'fa-calendar';
}

// Helper function to get month significance
function getMonthSignificance(monthIndex) {
  const significance = [
    'Sacred Month',
    'Travel Season',
    'Prophet\'s Birth',
    'Spring Season',
    'Winter Month',
    'Historical Battles',
    'Sacred Month',
    'Night of Forgiveness',
    'Month of Fasting',
    'Eid Celebration',
    'Sacred Month',
    'Hajj & Eid al-Adha'
  ];
  return significance[monthIndex] || 'Islamic Month';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize calendar
  updateCurrentDate();
  generateCalendar(currentMonth, currentYear);
  updateUpcomingEvents();
  displayAllMonths();
  
  // Update time every second
  setInterval(updateCurrentDate, 1000);
  
  // Month navigation
  document.getElementById('prev-month').addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });
  
  document.getElementById('next-month').addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });
  
  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      const navMenu = document.querySelector('.nav-menu');
      navMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });
  }
  
  // Add tooltips for calendar days with events
  document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('calendar-day') && e.target.getAttribute('data-event')) {
      const tooltip = document.createElement('div');
      tooltip.className = 'event-tooltip';
      tooltip.textContent = e.target.getAttribute('data-event');
      document.body.appendChild(tooltip);
      
      const rect = e.target.getBoundingClientRect();
      tooltip.style.top = (rect.top - 35) + 'px';
      tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
    }
  });
  
  document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('calendar-day')) {
      const tooltips = document.querySelectorAll('.event-tooltip');
      tooltips.forEach(tooltip => tooltip.remove());
    }
  });
});