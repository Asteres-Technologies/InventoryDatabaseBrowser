window.surveyConfig = {
  "Autonomy Readiness": {
    definition: `This attribute assesses whether a system or component possesses the necessary built-in sensors, diagnostics, and digital interfaces to support independent, automated operation and monitoring. High-scoring technologies are those that can be continuously and remotely monitored, provide actionable data for health and performance, and are fully controllable by autonomous or digital systems. The attribute emphasizes not just the presence of sensors, but the completeness and quality of the device or system sensor suite.`,
    scaleValues: [0,1,2,3,4,5,6,7,8,9,10],
    scaleDescription: `
      <b>Scale Example:</b><br>
      <b>1–2</b>: No built-in sensors or digital interfaces; cannot be digitally monitored, measured, or controlled in current state.<br>
      <b>3–4</b>: Basic sensors or indicators provide some remote monitoring or feedback, establishing a foundation for future automation.<br>
      <b>5–6</b>: Multiple sensors and digitally controllable mechanisms enable basic remote or automated operation, with some diagnostics available for system monitoring.<br>
      <b>7–8</b>: Comprehensive sensor suite and digital controls designed for integration with control systems.<br>
      <b>9–10</b>: System or device has integrated sensors and diagnostics for predictive maintenance, supports continuous remote monitoring and updates, and has onboard automation.
    `
  },
  "Industry Impact": {
    definition: `This attribute measures the extent to which a technology creates new market opportunities, enhances capabilities, or disrupts existing industry practices. It considers how the technology can change established markets, enable new business models, open up entirely new markets, or significantly improve efficiency and cost-effectiveness across the value chain.`,
    scaleValues: [0,1,2,3,4,5,6,7,8,9,10],
    scaleDescription: `
      <b>Scale Example:</b><br>
      <b>1–2</b>: Focused on niche or specialized applications, providing steady value in established markets.<br>
      <b>3–4</b>: Initial traction; some efficiency or cost gains, but no change to industry practices.<br>
      <b>5–6</b>: Contributing to improved efficiency or cost savings, and gaining recognition for enhancing current operations.<br>
      <b>7–8</b>: Adoption is widespread; enables new ways of doing business, but industry structure is intact.<br>
      <b>9–10</b>: Technology is the basis for a new sector, or has driven disruptive shifts in the industry.
    `
  },
  "Modularity & Serviceability": {
    definition: `This attribute measures the degree to which a technology can be easily reconfigured, upgraded, or repaired without significant downtime or cost. It also assesses how broadly the technology can be used across different platforms, missions, or operational environments. High modularity and serviceability enable rapid adaptation, easier upgrades, and cost-effective maintenance, supporting long-term sustainability and mission flexibility.`,
    scaleValues: [0,1,2,3,4,5,6,7,8,9,10],
    scaleDescription: `
      <b>Scale Example:</b><br>
      <b>1–2</b>: Designed for specific applications or missions with a focus on reliability and simplicity.<br>
      <b>3–4</b>: Some modular features allowing basic repairs with expert or OEM intervention.<br>
      <b>5–6</b>: Moderate modularity enabling replacement and upgrades with OEM support and downtime around planned maintenance.<br>
      <b>7–8</b>: Well-designed modularity; most components are easily replaceable or upgradable, with standardized interfaces and serviceability by multiple providers.<br>
      <b>9–10</b>: Fully modular and standardized design; easy to reconfigure, upgrade, or repair, with broad compatibility across missions and platforms and serviceability by any qualified provider.
    `
  },
  "Operational Value Ratio": {
    definition: `This attribute measures how much mission-enabling value, utility, or capability a technology delivers relative to its mass and cost of integration. This attribute captures not only direct cost savings or payload efficiency but also the technology’s ability to multiply operational benefits, such as extending mission duration, enabling repeat use, or unlocking new mission profiles, compared to its physical footprint.`,
    scaleValues: [0,1,2,3,4,5,6,7,8,9,10],
    scaleDescription: `
      <b>Scale Example:</b><br>
      <b>1–2</b>: Design focuses on reliability or simplicity, with opportunities to further enhance operational value relative to mass.<br>
      <b>3–4</b>: Some operational value beyond basic function is being realized, with ongoing potential for greater mission impact as the technology evolves.<br>
      <b>5–6</b>: Delivers a balanced ratio of operational value to mass, meeting current industry expectations and supporting effective mission performance.<br>
      <b>7–8</b>: Provides strong operational value relative to mass, enabling clear mission enhancements such as extended use, cost savings, or new capabilities.<br>
      <b>9–10</b>: Sets a high standard for operational value, enabling transformative mission outcomes, extensive reuse, or significant operational savings far beyond its physical footprint.
    `
  },
  "Commercial Viability Timeline": {
    definition: `This attribute assesses the likelihood that a technology will achieve successful market adoption and generate revenue within a defined timeframe. It considers factors such as technology readiness, market demand, investor interest, regulatory environment, and the speed at which the technology can transition from development to commercial deployment.`,
    scaleValues: [0,1,2,3,4,5,6,7,8,9,10],
    scaleDescription: `
      <b>Scale Example:</b><br>
      <b>1–2</b>: Advancing through early validation with an enthusiastic team, exploring funding options, and starting to build relationships for future market entry.<br>
      <b>3–4</b>: Building foundational experience with mostly government or grant funding; initial customer interest or pilot projects growing market visibility.<br>
      <b>5–6</b>: Solid team with a balanced mix of private investment and government/grant funding; early customer successes and growing recognition.<br>
      <b>7–8</b>: Strong industry expertise supported mainly by private funding; multiple customer deployments and established commercial presence.<br>
      <b>9–10</b>: Proven track record with funding driven primarily by recurring revenue and commercial contracts; broad customer adoption and market leadership.
    `
  },
  "Operational Environment Flexibility": {
    definition: `This attribute measures how well a technology can function across different orbital and planetary environments, as well as under varying operational conditions. It reflects the adaptability and robustness of the technology when exposed to diverse settings, such as different gravity fields, radiation levels, thermal extremes, and mission profiles. For this attribute, we use a multiple choice categorical scale rather than a numerical scale to better capture the range of operational environments.<br>
    <b>Options:</b><br>
    1: Low Earth Orbit (LEO); 2,000 km and below (ISS, most satellites)<br>
    2: Medium Earth Orbit (MEO); 2,000–35,786 km; navigation satellites<br>
    3: Geostationary Orbit (GEO); ~35,786 km; communications/weather satellites<br>
    4: Highly Elliptical Orbit (HEO); high-eccentricity, specialized missions<br>
    5: Cislunar Space; between Earth and Moon, incl. Lagrange points<br>
    6: Lunar Orbit (LLO); orbits around the Moon<br>
    7: Lunar Surface; surface operations on the Moon<br>
    8: Deep Space; beyond Earth–Moon, interplanetary<br>
    9: Other Celestial Bodies; asteroids, Mars, other planets
    `,
    categories: [
      "Low Earth Orbit (LEO); 2,000 km and below (ISS, most satellites)",
      "Medium Earth Orbit (MEO); 2,000–35,786 km; navigation satellites",
      "Geostationary Orbit (GEO); ~35,786 km; communications/weather satellites",
      "Highly Elliptical Orbit (HEO); high-eccentricity, specialized missions",
      "Cislunar Space; between Earth and Moon, incl. Lagrange points",
      "Lunar Orbit (LLO); orbits around the Moon",
      "Lunar Surface; surface operations on the Moon",
      "Deep Space; beyond Earth–Moon, interplanetary",
      "Other Celestial Bodies; asteroids, Mars, other planets"
    ]
  }
};